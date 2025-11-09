import { useState } from 'react'
import { useProjects } from '@/contexts/ProjectContext'
import { useTeam } from '@/contexts/TeamContext'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import type { Activity } from '@/types'

export function ChatPage() {
  const { currentProject } = useProjects()
  const { addActivity, getActivitiesByProject } = useTeam()
  const [message, setMessage] = useState('')

  const activities = currentProject
    ? getActivitiesByProject(currentProject.id).filter(a => a.type === 'message')
    : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !currentProject) return

    const newActivity: Omit<Activity, 'id'> = {
      type: 'message',
      description: message,
      timestamp: new Date().toISOString(),
      user: 'You',
      projectId: currentProject.id
    }

    addActivity(newActivity)
    setMessage('')
  }

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">No project selected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-[#0d181c]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101c22] px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Team Chat
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Communicate with your team
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white text-sm font-medium">
                    {activity.user[0]}
                  </div>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                      {activity.user}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-[#101c22] rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-800">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101c22] px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
