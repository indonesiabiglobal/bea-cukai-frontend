import { useToast } from 'primevue/usetoast'
import { createSharedComposable } from '@vueuse/core'

type NotifyType = 'success' | 'error' | 'info' | 'warn'

export const useToaster = createSharedComposable(() => {
    const toast = useToast()

    const showToast = (severity: NotifyType, message: string, title: string | null) => {
        toast.add({
            severity,
            summary: title || severity.charAt(0).toUpperCase() + severity.slice(1),
            detail: message,
            life: 3000,
            group: 'tr'
        })
    }

    return {
        success: (message: string, title: string | null = null) => showToast('success', message, title),
        error: (message: string, title: string | null = null) => showToast('error', message, title),
        info: (message: string, title: string | null = null) => showToast('info', message, title),
        warn: (message: string, title: string | null = null) => showToast('warn', message, title),
        dismissAll: () => toast.removeAllGroups(),
    }
})
