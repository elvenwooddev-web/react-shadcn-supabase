import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useTeam } from '@/contexts/TeamContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { MessageSquare, Send, AtSign, MoreVertical, Trash2, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TaskComment, TeamMember, Task } from '@/types'
import { generateId } from '@/lib/helpers'

interface TaskCommentsProps {
  task: Task
  comments: TaskComment[]
  onAddComment: (comment: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt' | 'edited'>) => void
  onUpdateComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
}

export function TaskComments({ task, comments, onAddComment, onUpdateComment, onDeleteComment }: TaskCommentsProps) {
  const { currentUser } = useUser()
  const { teamMembers } = useTeam()
  const { addNotification } = useNotifications()

  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter team members for mention suggestions
  const mentionSuggestions = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  // Handle typing in the comment box
  const handleTextChange = (value: string) => {
    setNewComment(value)

    // Check if user typed @ to show mentions
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1)
      // Show mentions if @ is at start or has space before it
      if (lastAtSymbol === 0 || value[lastAtSymbol - 1] === ' ') {
        setShowMentionSuggestions(true)
        setMentionSearch(textAfterAt)
        setCursorPosition(lastAtSymbol)
      } else {
        setShowMentionSuggestions(false)
      }
    } else {
      setShowMentionSuggestions(false)
    }
  }

  // Insert mention
  const insertMention = (member: TeamMember) => {
    const beforeMention = newComment.slice(0, cursorPosition)
    const afterMention = newComment.slice(cursorPosition + mentionSearch.length + 1)
    const newText = `${beforeMention}@${member.name} ${afterMention}`

    setNewComment(newText)
    setShowMentionSuggestions(false)
    textareaRef.current?.focus()
  }

  // Extract mentioned user IDs from comment text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]
      const member = teamMembers.find(m => m.name === mentionedName)
      if (member) {
        mentions.push(member.userId || member.id)
      }
    }

    return mentions
  }

  // Handle submitting a new comment
  const handleSubmit = () => {
    if (!newComment.trim() || !currentUser) return

    const mentions = extractMentions(newComment)

    const comment: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt' | 'edited'> = {
      taskId: task.id,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        userId: currentUser.id,
      },
      content: newComment,
      mentions,
    }

    onAddComment(comment)

    // Send notifications to mentioned users
    mentions.forEach(userId => {
      if (userId !== currentUser.id) {
        addNotification({
          userId,
          type: 'mention',
          title: 'You were mentioned',
          message: `${currentUser.name} mentioned you in a comment on "${task.title}"`,
          relatedEntityType: 'comment',
          relatedEntityId: task.id,
          projectId: undefined,
        })
      }
    })

    setNewComment('')
  }

  // Handle editing a comment
  const startEditing = (comment: TaskComment) => {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
  }

  const saveEdit = () => {
    if (editingCommentId && editingContent.trim()) {
      onUpdateComment(editingCommentId, editingContent)
      setEditingCommentId(null)
      setEditingContent('')
    }
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  // Render comment with highlighted mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\w+(?:\s+\w+)*)/g)

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.slice(1)
        const isMentioned = teamMembers.some(m => m.name === mentionedName)

        if (isMentioned) {
          return (
            <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
              {part}
            </span>
          )
        }
      }
      return <span key={index}>{part}</span>
    })
  }

  if (!currentUser) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8"
              />
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        {comment.edited && ' (edited)'}
                      </span>
                    </div>
                    {currentUser.id === (comment.author.userId || comment.author.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(comment)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteComment(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <TextareaAutosize
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-2 rounded border resize-none bg-background"
                        minRows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {renderCommentContent(comment.content)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <div className="border rounded-lg p-3 bg-card relative">
        <div className="flex gap-3">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8"
          />
          <div className="flex-1">
            <TextareaAutosize
              ref={textareaRef}
              value={newComment}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Add a comment... Use @ to mention someone"
              className="w-full resize-none bg-transparent border-none focus:outline-none"
              minRows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit()
                }
              }}
            />

            {/* Mention Suggestions */}
            {showMentionSuggestions && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {mentionSuggestions.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
                  >
                    <Avatar src={member.avatar} alt={member.name} className="w-6 h-6" />
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setNewComment(newComment + '@')
                  textareaRef.current?.focus()
                }}
              >
                <AtSign className="w-4 h-4 mr-1" />
                Mention
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                size="sm"
              >
                <Send className="w-4 h-4 mr-1" />
                Comment
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Press Cmd+Enter to submit
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
