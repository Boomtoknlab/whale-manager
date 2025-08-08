import React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          className={`w-96 ${
            toast.variant === 'destructive'
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-green-500/50 bg-green-500/10'
          }`}
        >
          {toast.variant === 'destructive' ? (
            <AlertTriangle className="h-4 w-4 text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-400" />
          )}
          <AlertTitle className={toast.variant === 'destructive' ? 'text-red-400' : 'text-green-400'}>
            {toast.title}
          </AlertTitle>
          {toast.description && (
            <AlertDescription className={toast.variant === 'destructive' ? 'text-red-300' : 'text-green-300'}>
              {toast.description}
            </AlertDescription>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => dismiss(toast.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
