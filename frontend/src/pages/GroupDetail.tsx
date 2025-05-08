import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Group, GroupMember, GroupPortfolio } from "@/types/group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupPortfolioList from "@/components/group/GroupPortfolioList";
import SharePortfolioModal from "@/components/group/SharePortfolioModal";
import { safeParsePortfolioContent } from "@/types/portfolio";
import { PostgrestError } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [portfolios, setPortfolios] = useState<GroupPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;

    try {
      setLoading(true);

      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      setGroup(groupData);

      if (user) {
        // Check if user is a member
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("*")
          .eq("group_id", groupId)
          .eq("user_id", user.id);

        if (!memberError && memberData && memberData.length > 0) {
          setIsMember(true);
        }

        // Get all members
        const { data: allMembers, error: membersError } = await supabase
          .from("group_members")
          .select(
            `
            *,
            profiles:user_id (
              id,
              display_name,
              email
            )
          `
          )
          .eq("group_id", groupId);

        if (!membersError && allMembers) {
          // Transform the data to match our TypeScript interface
          const typedMembers: GroupMember[] = allMembers.map((member) => {
            // Check if profiles is an error and handle it - fixed null check
            const profileData =
              member.profiles &&
              typeof member.profiles === "object" &&
              !("error" in member.profiles)
                ? member.profiles
                : null;

            return {
              ...member,
              profiles: profileData,
            };
          });

          setMembers(typedMembers);
        }

        // Get shared portfolios if user is a member
        if (memberData && memberData.length > 0) {
          console.log("Fetching shared portfolios for group:", groupId);
          const { data: portfolioData, error: portfolioError } = await supabase
            .from("group_portfolios")
            .select(
              `
              id,
              group_id,
              portfolio_id,
              shared_by,
              shared_at,
              portfolios (
                id,
                title,
                description,
                content,
                user_id,
                created_at,
                updated_at
              )
            `
            )
            .eq("group_id", groupId);

          if (portfolioError) {
            console.error("Error fetching shared portfolios:", portfolioError);
            throw portfolioError;
          }

          console.log("Fetched portfolio data:", portfolioData);

          if (portfolioData) {
            // Transform the data to match our TypeScript interface
            const typedPortfolios: GroupPortfolio[] = portfolioData.map(
              (item) => ({
                ...item,
                portfolios: {
                  ...item.portfolios,
                  content: safeParsePortfolioContent(item.portfolios.content),
                },
                profiles: null, // We'll fetch profiles separately if needed
              })
            );

            console.log("Transformed portfolios:", typedPortfolios);
            setPortfolios(typedPortfolios);
          }
        }
      }
    } catch (error: unknown) {
      const pgError = error as PostgrestError;
      toast({
        title: "Error fetching group details",
        description: pgError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Joined group successfully",
        description: `You've joined ${group?.name}`,
      });

      setIsMember(true);
      fetchGroupDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error joining group",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Left group successfully",
        description: `You've left ${group?.name}`,
      });

      setIsMember(false);
      setPortfolios([]); // Clear portfolios as user can't see them anymore
    } catch (error: any) {
      toast({
        title: "Error leaving group",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !user) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted",
      });

      navigate("/groups");
    } catch (error: unknown) {
      const pgError = error as PostgrestError;
      toast({
        title: "Error deleting group",
        description: pgError.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Group not found</h2>
            <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate("/groups")}
              className="inline-flex items-center text-sm text-gray-600 mb-2"
            >
              &larr; Back to Groups
            </button>
            <h1 className="text-3xl font-bold">{group.name}</h1>
          </div>

          <div className="flex gap-2">
            {user && isMember ? (
              <>
                <Button
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-gray-700 hover:bg-gray-800"
                >
                  Share Portfolio
                </Button>
                {user?.user_type === "admin" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Group"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this group? This
                          action cannot be undone and will permanently delete:
                          <ul className="list-disc list-inside mt-2">
                            <li>All shared portfolios</li>
                            <li>All group discussions</li>
                            <li>All member associations</li>
                            <li>All group data</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteGroup}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete Group
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button variant="outline" onClick={handleLeaveGroup}>
                  Leave Group
                </Button>
              </>
            ) : (
              <Button onClick={handleJoinGroup}>Join Group</Button>
            )}
          </div>
        </div>

        {group.cover_image && (
          <div className="relative mb-6 h-40 md:h-60 overflow-hidden rounded-lg">
            <img
              src={group.cover_image}
              alt={`${group.name} cover`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        {group.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-2">About this group</h3>
                <p>{group.description}</p>
              </div>
              {user?.user_type === "admin" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      className="ml-4"
                    >
                      {isDeleting ? "Deleting..." : "Delete Group"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this group? This action
                        cannot be undone and will permanently delete:
                        <ul className="list-disc list-inside mt-2">
                          <li>All shared portfolios</li>
                          <li>All group discussions</li>
                          <li>All member associations</li>
                          <li>All group data</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        {user && isMember ? (
          <Tabs defaultValue="portfolios" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolios">
              <GroupPortfolioList
                portfolios={portfolios}
                onRefresh={fetchGroupDetails}
                isCurrentUserOwner={user?.id === group?.created_by}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-2">
              Join this group to see shared portfolios
            </h2>
            {user ? (
              <Button onClick={handleJoinGroup} className="mt-4">
                Join Group
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} className="mt-4">
                Sign in to Join
              </Button>
            )}
          </div>
        )}
      </div>

      {isShareModalOpen && (
        <SharePortfolioModal
          groupId={groupId || ""}
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShareSuccess={fetchGroupDetails}
        />
      )}
    </>
  );
};

export default GroupDetail;
