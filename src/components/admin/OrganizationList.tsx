'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/supabase/auth'
import { Building, Settings, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Organization = {
  id: string
  name: string
  description: string
  organization_code: string
}

type Props = {
  refreshTrigger: number
}

export function OrganizationList({ refreshTrigger }: Props) {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return
      setLoading(true)
      try {
        // userが所属している団体を取得 (SupabaseのJOIN)
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            role,
            organizations (
              id,
              name,
              description,
              organization_code
            )
          `)
          .eq('user_id', user.id)

        if (error) throw error

        if (data) {
          // organizations のみを抽出
          const orgs = data.map((d: any) => d.organizations) as Organization[]
          setOrganizations(orgs)
        }
      } catch (err) {
        console.error('Error fetching organizations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [user, refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Building className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">まだ所属している団体はありません。</p>
        <p className="text-gray-400 text-sm mt-1">上のフォームから新しい団体を作成してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {organizations.map((org) => (
        <div key={org.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{org.name}</h4>
              <p className="text-sm text-gray-500 truncate max-w-md">
                {org.description || '説明なし'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link 
              href={`/admin/orgs/${org.organization_code}`}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              管理
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
