import React from "react";
import { GroupPortfolio } from "@/types/group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface GroupPortfolioListProps {
  portfolios: GroupPortfolio[];
  onRefresh: () => void;
  isCurrentUserOwner: boolean;
}

const GroupPortfolioList: React.FC<GroupPortfolioListProps> = ({
  portfolios,
  onRefresh,
  isCurrentUserOwner,
}) => {
  const navigate = useNavigate();

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No portfolios have been shared in this group yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolios.map((portfolio) => (
        <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold truncate">
              {portfolio.portfolios.title}
            </CardTitle>
            <p className="text-sm text-gray-500">
              Shared{" "}
              {formatDistanceToNow(new Date(portfolio.shared_at), {
                addSuffix: true,
              })}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {portfolio.portfolios.description || "No description provided"}
            </p>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => navigate(`/portfolio/${portfolio.portfolio_id}`)}
              >
                View Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GroupPortfolioList;
