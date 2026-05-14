import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth.store'

export const useAuth = () => {
  const { user, isLoading, setUser, clearUser } = useAuthStore()

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      return res.data.user
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    if (data) setUser(data)
    else if (!queryLoading) clearUser()
  }, [data, queryLoading])

  return { user, isLoading: queryLoading }
}