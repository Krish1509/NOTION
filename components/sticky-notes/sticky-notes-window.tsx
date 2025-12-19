/**
 * Sticky Notes Window Component
 * 
 * Main drawer panel for sticky notes with list view and create/edit functionality.
 */

"use client";

// Export the component

import { useState } from "react";
import { Plus, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyNoteCard } from "./sticky-note-card";
import { StickyNoteForm } from "./sticky-note-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useStickyNotes,
  useCreateStickyNote,
  useUpdateStickyNote,
  useCompleteStickyNote,
  useDeleteStickyNote,
} from "@/hooks/use-sticky-notes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useUserRole } from "@/hooks/use-user-role";
import { ROLES } from "@/lib/auth/roles";

interface StickyNotesWindowProps {
  currentUserId: Id<"users">;
  onClose?: () => void;
  className?: string;
}

export function StickyNotesWindow({
  currentUserId,
  onClose,
  className,
}: StickyNotesWindowProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<Id<"stickyNotes"> | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "assigned">("active");

  const allNotesList = useStickyNotes(true); // Get all notes
  const currentUser = useQuery(api.users.getCurrentUser);
  const userRole = useUserRole();
  const isManager = userRole === ROLES.MANAGER;
  
  // Filter notes locally
  const activeNotes = allNotesList?.filter(note => !note.isCompleted) || [];
  const completedNotes = allNotesList?.filter(note => note.isCompleted) || [];
  
  // For managers: Notes assigned to others (not self) - all notes assigned to other users
  const assignedNotes = isManager && currentUser
    ? allNotesList?.filter(note => 
        note.assignee?._id && note.assignee._id !== currentUser._id
      ) || []
    : [];

  const createNote = useCreateStickyNote();
  const updateNote = useUpdateStickyNote();
  const completeNote = useCompleteStickyNote();
  const deleteNote = useDeleteStickyNote();

  // Get note to edit
  const editingNote = editingNoteId
    ? allNotesList?.find((n) => n._id === editingNoteId)
    : null;

  // Filter notes by search query
  const filterNotes = (notes: typeof activeNotes) => {
    if (!notes || notes.length === 0) return [];
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  };

  const filteredActiveNotes = filterNotes(activeNotes);
  const filteredCompletedNotes = filterNotes(completedNotes);
  const filteredAssignedNotes = isManager ? filterNotes(assignedNotes) : [];

  const handleCreate = async (data: {
    assignedTo: Id<"users">;
    title: string;
    content: string;
    color: "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
    reminderAt?: number;
    checklistItems?: any[];
  }) => {
    try {
      await createNote(data);
      toast.success("Sticky note created!");
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create note");
    }
  };

  const handleUpdate = async (data: {
    assignedTo: Id<"users">;
    title: string;
    content: string;
    color: "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
    reminderAt?: number;
    checklistItems?: any[];
  }) => {
    if (!editingNoteId) return;
    try {
      await updateNote({
        noteId: editingNoteId,
        title: data.title,
        content: data.content,
        color: data.color,
        reminderAt: data.reminderAt,
        checklistItems: data.checklistItems || [],
      });
      toast.success("Sticky note updated!");
      setEditingNoteId(null);
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update note");
    }
  };

  const handleComplete = async (noteId: Id<"stickyNotes">, isCompleted: boolean) => {
    try {
      await completeNote({ noteId, isCompleted });
      toast.success(isCompleted ? "Note marked as completed!" : "Note unmarked!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update note");
    }
  };

  const handleDelete = async (noteId: Id<"stickyNotes">) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote({ noteId });
      toast.success("Note deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  const handleEdit = (noteId: Id<"stickyNotes">) => {
    setEditingNoteId(noteId);
    setShowForm(true);
  };

  const isCreator = (note: typeof activeNotes[0]) => {
    return note.creator?._id === currentUserId;
  };

  return (
    <div className={`flex flex-col h-full w-full bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0 shadow-sm w-full">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold truncate">
            Sticky Notes
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {filteredActiveNotes.length} active • {filteredCompletedNotes.length} completed
            {isManager && filteredAssignedNotes.length > 0 && ` • ${filteredAssignedNotes.length} assigned`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingNoteId(null);
            setShowForm(true);
          }}
          size="sm"
          className="shadow-sm shrink-0 h-8 px-2 sm:px-3"
        >
          <Plus className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>

      {/* Search */}
      <div className="py-3 sm:py-4 px-4 border-b border-border/50 bg-background/50 backdrop-blur-sm shrink-0 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/80 backdrop-blur-sm border-border/50 w-full"
          />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide w-full">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full h-full flex flex-col gap-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 shrink-0 px-4 pt-4 pb-2">
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="active" className="data-[state=active]:bg-background flex-1">
                Active ({filteredActiveNotes.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-background flex-1">
                Completed ({filteredCompletedNotes.length})
              </TabsTrigger>
              {isManager && (
                <TabsTrigger value="assigned" className="data-[state=active]:bg-background flex-1">
                  Assigned ({filteredAssignedNotes.length})
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0 w-full flex-1 min-h-0 flex flex-col data-[state=active]:flex">
            {filteredActiveNotes.length === 0 ? (
              <div className="text-center py-16 w-full px-4">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mb-2">No active notes</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first sticky note to get started!</p>
                <Button
                  onClick={() => {
                    setEditingNoteId(null);
                    setShowForm(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-4 w-full">
                  {filteredActiveNotes.map((note) => (
                    <StickyNoteCard
                      key={note._id}
                      note={note}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onChecklistUpdate={async (noteId, items) => {
                        try {
                          await updateNote({ noteId, checklistItems: items });
                        } catch (error: any) {
                          toast.error("Failed to update checklist");
                        }
                      }}
                      isCreator={isCreator(note)}
                      disableDrag={true}
                      isManager={isManager}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0 w-full flex-1 min-h-0 flex flex-col data-[state=active]:flex">
            {filteredCompletedNotes.length === 0 ? (
              <div className="text-center py-16 w-full px-4">
                <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mb-2">No completed notes</p>
                <p className="text-sm text-muted-foreground">Completed notes will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-4 w-full">
                  {filteredCompletedNotes.map((note) => (
                    <StickyNoteCard
                      key={note._id}
                      note={note}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onChecklistUpdate={async (noteId, items) => {
                        try {
                          await updateNote({ 
                            noteId, 
                            checklistItems: items.length > 0 ? items : [] 
                          });
                          // Don't show toast for every checkbox toggle to avoid spam
                        } catch (error: any) {
                          toast.error("Failed to update checklist");
                        }
                      }}
                      isCreator={isCreator(note)}
                      disableDrag={true}
                      isManager={isManager}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Assigned Tab - Only for Managers */}
          {isManager && (
            <TabsContent value="assigned" className="mt-0 w-full flex-1 min-h-0 flex flex-col data-[state=active]:flex">
              {filteredAssignedNotes.length === 0 ? (
                <div className="text-center py-16 w-full px-4">
                  <div className="inline-flex h-16 w-16 rounded-full bg-muted/50 items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No assigned notes</p>
                  <p className="text-sm text-muted-foreground">Notes you assign to others will appear here.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                  <div className="flex flex-col gap-4 w-full">
                    {filteredAssignedNotes.map((note) => (
                      <StickyNoteCard
                        key={note._id}
                        note={note}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onChecklistUpdate={async (noteId, items) => {
                          try {
                            await updateNote({ noteId, checklistItems: items });
                          } catch (error: any) {
                            toast.error("Failed to update checklist");
                          }
                        }}
                        isCreator={isCreator(note)}
                        disableDrag={true}
                        isManager={isManager}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm} modal={true}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editingNoteId ? "Edit Sticky Note" : "Create Sticky Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 pr-2 -mr-2 scrollbar-hide">
            <StickyNoteForm
              noteId={editingNoteId || undefined}
              initialData={editingNote ? {
              title: editingNote.title,
              content: editingNote.content,
              color: editingNote.color,
              reminderAt: editingNote.reminderAt,
              assignedTo: editingNote.assignedTo,
              checklistItems: editingNote.checklistItems,
            } : undefined}
              currentUserId={currentUserId}
              onSubmit={editingNoteId ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingNoteId(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

