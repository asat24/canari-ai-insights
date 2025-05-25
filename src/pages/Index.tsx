
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Plus, Star, Bell } from 'lucide-react';
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
    { symbol: 'AMZN', name: 'Amazon.com Inc.' }
  ];

  useEffect(() => {
    if (selectedStock) {
      analyzeStock(selectedStock);
    }
  }, [selectedStock]);

  const analyzeStock = async (symbol) => {
    setLoading(true);
    try {
      console.log(`Analyzing stock: ${symbol}`);
      
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

      console.log('Stock analysis completed:', { stockResult, newsResult, sentimentResult });
    } catch (error) {
      console.error('Error analyzing stock:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toUpperCase();
      setSelectedStock(query);
      setSearchQuery('');
    }
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      toast({
        title: "Added to Watchlist",
        description: `${symbol} has been added to your watchlist.`,
      });
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.2) return 'text-green-400';
    if (score < -0.2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentAction = (score) => {
    if (score > 0.2) return { action: 'BUY', icon: '💚' };
    if (score < -0.2) return { action: 'SELL', icon: '🔴' };
    return { action: 'HOLD', icon: '⚡' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Canari
              </h1>
            </div>
            <p className="text-sm text-gray-400 hidden md:block">
              AI-Powered Stock Analysis & Intelligence
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Ticker Tabs */}
      <StockTickerTabs 
        stocks={popularStocks} 
        selectedStock={selectedStock} 
        onStockSelect={setSelectedStock} 
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Analysis Card */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-400">{selectedStock}</h2>
                  {stockData && (
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-3xl font-bold">
                        ${stockData.currentPrice?.toFixed(2) || '---'}
                      </span>
                      {stockData.changePercent && (
                        <span className={`flex items-center space-x-1 ${
                          stockData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stockData.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{stockData.changePercent.toFixed(2)}%</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {sentiment && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getSentimentColor(sentiment.score)}`}>
                      {getSentimentAction(sentiment.score).icon} {getSentimentAction(sentiment.score).action}
                    </div>
                    <div className="text-sm text-gray-400">
                      Sentiment: {sentiment.score.toFixed(3)}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => addToWatchlist(selectedStock)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Star className="w-4 h-4" />
                </Button>
              </div>

              {/* Chart */}
              <div className="h-64 mb-4">
                {stockData ? (
                  <StockChart data={stockData.chartData || []} />
                ) : (
                  <div className="h-full bg-gray-800/30 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">
                      {loading ? 'Loading chart data...' : 'No chart data available'}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <Button
                onClick={() => analyzeStock(selectedStock)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Card>
          </div>

          {/* News Feed */}
          <div className="space-y-4">
            <Card className="bg-gray-900/50 backdrop-blur-xl border-white/10 p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Latest News</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsData.length > 0 ? (
                  newsData.map((article, index) => (
                    <NewsCard key={index} article={article} />
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    {loading ? 'Fetching latest news...' : 'No news available'}
                  </div>
                )}
              </div>
            </Card>

            {/* Watchlist */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-white/10 p-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Watchlist</h3>
              <div className="space-y-2">
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    onClick={() => setSelectedStock(symbol)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedStock === symbol
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-gray-800/30 hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{symbol}</span>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Search Bar - Fixed at bottom */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search stocks (e.g., AAPL, TSLA, GOOGL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 backdrop-blur-xl border-white/20 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-full focus:border-green-500/50 focus:ring-green-500/20"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full px-4"
            >
              <Search className="w-3 h-3" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
