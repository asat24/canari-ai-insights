
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Star, Bell, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StockChart from '@/components/StockChart';
import NewsCard from '@/components/NewsCard';
import StockTickerTabs from '@/components/StockTickerTabs';
import { fetchStockData, fetchNewsData, analyzeSentiment } from '@/utils/stockApi';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN']);
  const { toast } = useToast();

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' }
  ];

  useEffect(() => {
    if (selectedStock) {
      analyzeStock(selectedStock);
    }
  }, [selectedStock]);

  const analyzeStock = async (symbol: string) => {
    setLoading(true);
    try {
      console.log(`🔍 Analyzing stock: ${symbol}`);
      
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch stock data and news in parallel
      const [stockResult, newsResult] = await Promise.all([
        fetchStockData(symbol),
        fetchNewsData(symbol)
      ]);

      setStockData(stockResult);
      setNewsData(newsResult);

      // Analyze sentiment from news
      const sentimentResult = analyzeSentiment(newsResult);
      setSentiment(sentimentResult);

      console.log('✅ Stock analysis completed:', { stockResult, newsResult, sentimentResult });
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${symbol} with ${newsResult.length} news articles`,
      });
    } catch (error) {
      console.error('❌ Error analyzing stock:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toUpperCase();
      setSelectedStock(query);
      setSearchQuery('');
    }
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      toast({
        title: "Added to Watchlist",
        description: `${symbol} has been added to your watchlist.`,
      });
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'text-green-400';
    if (score < -0.2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentAction = (score: number) => {
    if (score > 0.2) return { action: 'BUY', icon: '💚', bgColor: 'bg-green-500/20 border-green-500/30' };
    if (score < -0.2) return { action: 'SELL', icon: '🔴', bgColor: 'bg-red-500/20 border-red-500/30' };
    return { action: 'HOLD', icon: '⚡', bgColor: 'bg-yellow-500/20 border-yellow-500/30' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white font-bold" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white via-green-200 to-emerald-400 bg-clip-text text-transparent">
                  CANARI
                </h1>
                <p className="text-xs text-gray-400 font-medium">AI-Powered Intelligence</p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-gray-300 font-semibold">
                Real-time Stock Analysis & Sentiment
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => analyzeStock(selectedStock)}
                variant="ghost" 
                size="sm" 
                disabled={loading}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stock Ticker Tabs */}
      <StockTickerTabs 
        stocks={popularStocks} 
        selectedStock={selectedStock} 
        onStockSelect={setSelectedStock} 
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/60 backdrop-blur-xl border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tight">{selectedStock}</h2>
                  {stockData && (
                    <div className="flex items-center space-x-6 mt-3">
                      <span className="text-4xl font-black text-white">
                        ${stockData.currentPrice?.toFixed(2) || '---'}
                      </span>
                      {stockData.changePercent !== undefined && (
                        <span className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${
                          stockData.changePercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {stockData.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{stockData.changePercent.toFixed(2)}%</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {sentiment && (
                  <div className={`text-right p-4 rounded-xl border ${getSentimentAction(sentiment.score).bgColor}`}>
                    <div className={`text-2xl font-black ${getSentimentColor(sentiment.score)}`}>
                      {getSentimentAction(sentiment.score).icon} {getSentimentAction(sentiment.score).action}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      Score: {sentiment.score.toFixed(3)}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => addToWatchlist(selectedStock)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Star className="w-5 h-5" />
                </Button>
              </div>

              {/* Enhanced Chart */}
              <div className="h-80 mb-6 relative">
                {loading ? (
                  <div className="h-full bg-gray-800/40 rounded-xl flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <div className="text-gray-300 font-bold">Loading Chart Data...</div>
                    </div>
                  </div>
                ) : stockData?.chartData ? (
                  <StockChart data={stockData.chartData} />
                ) : (
                  <div className="h-full bg-gray-800/40 rounded-xl flex items-center justify-center border border-white/10">
                    <div className="text-gray-400 font-semibold">Chart data will appear here</div>
                  </div>
                )}
              </div>

              {/* Enhanced Analyze Button */}
              <Button
                onClick={() => analyzeStock(selectedStock)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze Stock'
                )}
              </Button>
            </Card>
          </div>

          {/* Enhanced News Feed */}
          <div className="space-y-6">
            <Card className="bg-gray-900/60 backdrop-blur-xl border-white/20 p-6 shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-white">Latest News</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <div className="text-gray-300 font-bold">Fetching Latest News...</div>
                  </div>
                ) : newsData.length > 0 ? (
                  newsData.map((article, index) => (
                    <NewsCard key={index} article={article} />
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8 font-semibold">
                    No news available
                  </div>
                )}
              </div>
            </Card>

            {/* Enhanced Watchlist */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-white/20 p-6 shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-white">Watchlist</h3>
              <div className="space-y-3">
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    onClick={() => setSelectedStock(symbol)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedStock === symbol
                        ? 'bg-green-500/20 border-2 border-green-500/50 shadow-lg'
                        : 'bg-gray-800/40 hover:bg-gray-700/40 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{symbol}</span>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search stocks (e.g., AAPL, TSLA, GOOGL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/90 backdrop-blur-xl border-white/30 text-white placeholder-gray-400 pl-12 pr-4 py-4 rounded-full focus:border-green-500/50 focus:ring-green-500/20 font-semibold shadow-2xl"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 font-bold shadow-lg"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
