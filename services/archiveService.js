import { supabase } from "@/lib/supabase"

export const archiveService = {
    // Get all archive requests
    async getAllArchiveRequests() {
        try {

            const { data, error } = await supabase
                .from('archive_requests')
                .select('*')
                
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            throw error
        }
    },

    // Get pending archive request entity IDs (for disabling archive buttons)
    async getPendingArchiveEntityIds() {
        // Return empty map structure as default - prevents Promise.all failures from breaking data loading
        const emptyMap = {
            student: new Set(),
            teacher: new Set(),
            course: new Set()
        }

        try {
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
        } catch (error) {
            console.error('getPendingArchiveEntityIds: Unexpected error, returning empty map', error)
            return emptyMap
        }
    },

    // Create archive request with current user info
    async createArchiveRequest(entityType, entityId, entityName, reason = null) {
        try {

            const userProfile = await getCurrentUserProfile()
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
                    school_id: schoolId,
                    entity_type: entityType,
                    entity_id: entityId,
                    entity_name: entityName,
                    reason: reason,
                    requested_by: userProfile.id,
                    requested_by_name: userProfile.full_name,
                    status: 'pending'
                }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Approve archive request and perform actual archive
    async approveArchiveRequest(requestId) {
        try {

            const userProfile = await getCurrentUserProfile()
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
                    approved_by_name: userProfile.full_name,
                    approved_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },

    // Deny archive request
    async denyArchiveRequest(requestId) {
        try {

            const userProfile = await getCurrentUserProfile()
            if (!userProfile) throw new Error('No user profile')

            const { data, error } = await supabase
                .from('archive_requests')
                .update({
                    status: 'denied',
                    approved_by: userProfile.id,
                    approved_by_name: userProfile.full_name,
                    approved_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    },
}
