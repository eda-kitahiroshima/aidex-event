import { supabase } from './supabase/client'

// VAPIDキーは本来サーバーで生成しますが、ここではプレースホルダとして扱います
const VAPID_PUBLIC_KEY = 'BEl62iC7S0629S3H4v6V5mJ1-Z_vXyS5F4S8R2C1D0E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W'

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

export async function subscribeUserToPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    const subJson = subscription.toJSON()
    
    // DBに保存
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([{
        user_id: userId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }])

    if (error) throw error
    console.log('User is subscribed to push notifications')
  } catch (error) {
    console.error('Failed to subscribe the user:', error)
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
