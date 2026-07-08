'use client'
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/hooks/useBoards";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, updateBoard } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  async function handleSaveChanges(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color
      });
      setIsEditingTitle(false);
    } catch (error) {

    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => {
          setNewTitle(board?.title || "");
          setNewColor(board?.color || "");
          setIsEditingTitle(true)
        }}
      />
      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Board Title</Label>
              <Input
                id="boardTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter board title..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boardColor">Board Color</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {["bg-blue-500",
                  "bg-green-500",
                  "bg-red-500",
                  "bg-yellow-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-indigo-500",
                  "bg-teal-500",
                  "bg-orange-500",
                  "bg-gray-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color} ${newColor === color ? "ring-2 ring-offset-2 ring-gray-900" : ""}`}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditingTitle(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
