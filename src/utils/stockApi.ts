
import yahooFinance from 'yahoo-finance2';
import { GNews } from 'gnews';
import { API_CONFIG } from '@/config/api';

// Initialize GNews with API key
const gnews = new GNews(API_CONFIG.GNEWS_API_KEY);

// Simple sentiment analysis function
const analyzeSentimentSimple = (text: string): number => {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'up', 'gain', 'profit', 'bull', 'rise', 'strong', 'growth', 'buy'];
  const negativeWords = ['bad', 'terrible', 'negative', 'down', 'loss', 'bear', 'fall', 'weak', 'decline', 'sell', 'drop'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });
  
  return Math.max(-1, Math.min(1, score));
};

// Enhanced sentiment analysis using multiple news articles
export const analyzeSentiment = (articles: any[]) => {
  if (!articles || articles.length === 0) {
    return { score: 0, summary: 'No sentiment data available' };
  }

  let totalScore = 0;
  let analyzedCount = 0;

  articles.forEach(article => {
    const text = (article.title + ' ' + (article.description || ''));
    const sentiment = analyzeSentimentSimple(text);
    totalScore += sentiment;
    analyzedCount++;
  });

  const avgScore = analyzedCount > 0 ? totalScore / analyzedCount : 0;
  
  return {
    score: avgScore,
    summary: avgScore > 0.05 ? 'Positive' : avgScore < -0.05 ? 'Negative' : 'Neutral'
  };
};

// Real stock data fetching using Yahoo Finance
export const fetchStockData = async (symbol: string) => {
  try {
    console.log(`Fetching real stock data for ${symbol} using Yahoo Finance`);
    
    // Fetch current quote
    const quote = await yahooFinance.quote(symbol);
    
    // Fetch historical data for chart (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    
    // Format chart data
    const chartData = historical.slice(-30).map(data => ({
      time: new Date(data.date).toLocaleDateString(),
      price: Number(data.close.toFixed(2))
    }));

    const currentPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || 0;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol,
      currentPrice: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      chartData
    };
  } catch (error) {
    console.error('Error fetching stock data from Yahoo Finance:', error);
    throw new Error(`Failed to fetch stock data for ${symbol}`);
  }
};

// News fetching using GNews
export const fetchNewsData = async (symbol: string) => {
  try {
    console.log(`Fetching real news for ${symbol} using GNews`);
    
    const articles = await gnews.search({
      q: `${symbol} stock`,
      lang: 'en',
      country: 'us',
      max: 10
    });
    
    return articles.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      sentiment: analyzeSentimentSimple(article.title + ' ' + (article.description || ''))
    }));
  } catch (error) {
    console.error('Error fetching news data from GNews:', error);
    throw new Error(`Failed to fetch news for ${symbol}`);
  }
};

// Get comprehensive stock analysis
export const getStockAnalysis = async (symbol: string) => {
  try {
    console.log(`Getting comprehensive analysis for ${symbol}`);
    
    const [stockData, newsData] = await Promise.all([
      fetchStockData(symbol),
      fetchNewsData(symbol)
    ]);
    
    const sentiment = analyzeSentiment(newsData);
    
    // Generate trading recommendation based on data
    let recommendation = 'HOLD';
    let confidence = 'Medium';
    
    const priceChange = stockData.changePercent;
    const sentimentScore = sentiment.score;
    
    if (sentimentScore > 0.3 && priceChange > 2) {
      recommendation = 'STRONG BUY';
      confidence = 'High';
    } else if (sentimentScore > 0.1 && priceChange > 0) {
      recommendation = 'BUY';
      confidence = 'Medium';
    } else if (sentimentScore < -0.3 && priceChange < -2) {
      recommendation = 'STRONG SELL';
      confidence = 'High';
    } else if (sentimentScore < -0.1 && priceChange < 0) {
      recommendation = 'SELL';
      confidence = 'Medium';
    }
    
    return {
      stockData,
      newsData,
      sentiment,
      recommendation,
      confidence,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting stock analysis:', error);
    throw new Error('Failed to get comprehensive stock analysis');
  }
};
