import { createClient } from "@/lib/supabase/client"

const supabase = createClient();
import { profileService } from "./profileService"
import { activityLogService } from "./activityLogService"
export const archiveService = {
    // Get all archive requests
    async getAllArchiveRequests() {
        const { data, error } = await supabase
            .from('archive_requests')
            .select('*, requester:profiles!archive_requests_requested_by_fkey(full_name), approver:profiles!archive_requests_approved_by_fkey(full_name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []).map((req) => ({
            ...req,
            requested_by_name: req.requester?.full_name || 'Unknown',
            approved_by_name: req.approver?.full_name || '-',
        }))

    },

    // Get pending archive request entity IDs (for disabling archive buttons)
    async getPendingArchiveEntityIds() {
        // Return empty map structure as default - prevents Promise.all failures from breaking data loading
        const emptyMap = {
            student: new Set(),
            teacher: new Set(),
            course: new Set()
        }
        const { data, error } = await supabase
            .from('archive_requests')
            .select('entity_type, entity_id')
            .eq('status', 'pending')

        if (error) {
            console.warn('getPendingArchiveEntityIds: Query error, returning empty map', error)
            return emptyMap
        }

        // Return a map of entity_type -> Set of entity_ids
        const pendingMap = {
            student: new Set(),
            teacher: new Set(),
            course: new Set()
        };

        (data || []).forEach(req => {
            if (pendingMap[req.entity_type]) {
                pendingMap[req.entity_type].add(req.entity_id)
            }
        })

        return pendingMap
    },

    // Create archive request with current user info
    async createArchiveRequest(entityType, entityId, entityName, reason = null) {
        const userProfile = await profileService.getCurrentUserProfile()
        if (!userProfile) throw new Error('No user profile')

        // Check if there's already a pending request for this entity
        const { data: existingRequest, error: checkError } = await supabase
            .from('archive_requests')
            .select('id')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .eq('status', 'pending')
            .single()

        if (checkError && checkError.code !== 'PGRST116') throw checkError

        if (existingRequest) {
            throw new Error('An archive request is already pending for this item')
        }

        const { data, error } = await supabase
            .from('archive_requests')
            .insert([{
                entity_type: entityType,
                entity_id: entityId,
                entity_name: entityName,
                reason: reason,
                requested_by: userProfile.id,
                status: 'pending'
            }])
            .select()
            .single()

        if (error) throw error

        await activityLogService.logActivity({
            action_type: 'archive_request',
            title: `Archive requested: ${entityName}`,
            description: reason || undefined,
            entity_type: entityType,
            entity_id: entityId,
        })

        return data
    },

    // Approve archive request and perform actual archive
    async approveArchiveRequest(requestId) {
        const userProfile = await profileService.getCurrentUserProfile()
        if (!userProfile) throw new Error('No user profile')

        // Get the archive request first
        const { data: request, error: fetchError } = await supabase
            .from('archive_requests')
            .select('*')
            .eq('id', requestId)

            .single()

        if (fetchError) throw fetchError
        if (!request) throw new Error('Archive request not found')

        // Perform the actual archive based on entity type
        if (request.entity_type === 'student') {
            await supabase
                .from('students')
                .update({ archived: true, archived_date: new Date().toISOString() })
                .eq('id', request.entity_id)

        } else if (request.entity_type === 'teacher') {
            await supabase
                .from('teachers')
                .update({ archived: true, archived_date: new Date().toISOString() })
                .eq('id', request.entity_id)

        } else if (request.entity_type === 'course') {
            // Guardrails: check for active enrollments, pending payments, and pending payouts
            const { data: activeEnrollments } = await supabase
                .from('course_enrollments')
                .select('id')
                .eq('course_id', request.entity_id)
                .eq('status', 'enrolled')

            const { data: openPayments } = await supabase
                .from('student_payments')
                .select('id')
                .eq('course_id', request.entity_id)
                .eq('status', 'pending')

            const { data: pendingPayouts } = await supabase
                .from('teacher_payouts')
                .select('id')
                .eq('course_id', request.entity_id)
                .eq('status', 'pending')

            if ((activeEnrollments?.length || 0) > 0) {
                throw new Error('Cannot archive: there are active enrollments. Drop all students first.')
            }
            if ((openPayments?.length || 0) > 0) {
                throw new Error('Cannot archive: there are pending student payments.')
            }
            if ((pendingPayouts?.length || 0) > 0) {
                throw new Error('Cannot archive: there are pending teacher payouts.')
            }

            await supabase
                .from('course_instances')
                .update({ archived: true, archived_date: new Date().toISOString() })
                .eq('id', request.entity_id)

        }

        // Update the archive request status
        const { data, error } = await supabase
            .from('archive_requests')
            .update({
                status: 'approved',
                approved_by: userProfile.id,
                approved_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single()

        if (error) throw error

        await activityLogService.logActivity({
            action_type: 'archive_approved',
            title: `Archive approved: ${request.entity_name || 'Unknown'}`,
            entity_type: request.entity_type,
            entity_id: request.entity_id,
        })

        return data
    },

    // Deny archive request
    async denyArchiveRequest(requestId) {
        const userProfile = await profileService.getCurrentUserProfile()
        if (!userProfile) throw new Error('No user profile')

        const { data, error } = await supabase
            .from('archive_requests')
            .update({
                status: 'denied',
                approved_by: userProfile.id,
                approved_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single()

        if (error) throw error

        // Fetch entity info for the audit log
        const { data: deniedReq } = await supabase
            .from('archive_requests')
            .select('entity_type, entity_id, entity_name')
            .eq('id', requestId)
            .maybeSingle()

        if (deniedReq) {
            await activityLogService.logActivity({
                action_type: 'archive_rejected',
                title: `Archive rejected: ${deniedReq.entity_name || 'Unknown'}`,
                entity_type: deniedReq.entity_type,
                entity_id: deniedReq.entity_id,
            })
        }

        return data
    },

    // Unarchive an entity and remove its archive request row so it leaves /manager/archive
    async unarchiveEntity(requestId) {
        const { data: request, error: fetchError } = await supabase
            .from('archive_requests')
            .select('*')
            .eq('id', requestId)
            .single()

        if (fetchError) throw fetchError
        if (!request) throw new Error('Archive request not found')

        if (request.entity_type === 'student') {
            const { error } = await supabase
                .from('students')
                .update({ archived: false, archived_date: null })
                .eq('id', request.entity_id)
            if (error) throw error
        } else if (request.entity_type === 'teacher') {
            const { error } = await supabase
                .from('teachers')
                .update({ archived: false, archived_date: null })
                .eq('id', request.entity_id)
            if (error) throw error
        } else if (request.entity_type === 'course') {
            const { error } = await supabase
                .from('course_instances')
                .update({ archived: false, archived_date: null })
                .eq('id', request.entity_id)
            if (error) throw error
        }

        const { error: deleteError } = await supabase
            .from('archive_requests')
            .delete()
            .eq('id', requestId)

        if (deleteError) throw deleteError

        await activityLogService.logActivity({
            action_type: 'unarchive',
            title: `Unarchived: ${request.entity_name || 'Unknown'}`,
            entity_type: request.entity_type,
            entity_id: request.entity_id,
        })

        return true
    },

    // Permanently remove the archive request row (used after a permanent entity delete)
    async deleteArchiveRequest(requestId) {
        const { error } = await supabase
            .from('archive_requests')
            .delete()
            .eq('id', requestId)

        if (error) throw error
        return true
    },
}
