
import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface NewsCardProps {
  article: {
    title: string;
    description?: string;
    url: string;
    publishedAt: string;
    source?: string;
    sentiment?: number;
  };
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-400';
    if (sentiment > 0.2) return 'text-green-400';
    if (sentiment < -0.2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card className="bg-gray-800/30 border-white/10 p-4 hover:bg-gray-700/30 transition-all duration-200 cursor-pointer">
      <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block space-y-2"
      >
        <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
          {article.title}
        </h4>
        
        {article.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDate(article.publishedAt)}</span>
            {article.source && (
              <>
                <span>•</span>
                <span>{article.source}</span>
              </>
            )}
          </div>
          
          {article.sentiment !== undefined && (
            <span className={`font-medium ${getSentimentColor(article.sentiment)}`}>
              {article.sentiment > 0.2 ? '📈' : article.sentiment < -0.2 ? '📉' : '📊'}
            </span>
          )}
        </div>
      </a>
    </Card>
  );
};

export default NewsCard;
