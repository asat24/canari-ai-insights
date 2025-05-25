
import VaderSentiment from 'vader-sentiment';
// @ts-ignore
import GNews from 'gnews';

// Initialize GNews (you'll need to set API key)
const gnews = new GNews({
  apikey: process.env.GNEWS_API_KEY || 'your-gnews-api-key-here',
  language: 'en',
  country: 'us',
  max: 10
});

// Enhanced sentiment analysis using vader-sentiment
export const analyzeSentiment = (articles: any[]) => {
  if (!articles || articles.length === 0) {
    return { score: 0, summary: 'No sentiment data available' };
  }

  let totalScore = 0;
  let analyzedCount = 0;

  articles.forEach(article => {
    const text = (article.title + ' ' + (article.description || ''));
    const sentiment = VaderSentiment.SentimentIntensityAnalyzer.polarity_scores(text);
    totalScore += sentiment.compound;
    analyzedCount++;
  });

  const avgScore = analyzedCount > 0 ? totalScore / analyzedCount : 0;
  
  return {
    score: avgScore,
    summary: avgScore > 0.05 ? 'Positive' : avgScore < -0.05 ? 'Negative' : 'Neutral'
  };
};

// Real stock data fetching using yahoo-finance2
export const fetchStockData = async (symbol: string) => {
  try {
    console.log(`Fetching real stock data for ${symbol}`);
    
    // Import yahoo-finance2 dynamically
    const yahooFinance = await import('yahoo-finance2');
    
    // Get current quote
    const quote = await yahooFinance.quote(symbol);
    
    // Get historical data for chart (last 30 days)
    const historical = await yahooFinance.historical(symbol, {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period2: new Date().toISOString().split('T')[0],
      interval: '1d'
    });

    // Format chart data
    const chartData = historical.slice(-30).map((item, index) => ({
      time: new Date(item.date).toLocaleDateString(),
      price: Number(item.close.toFixed(2))
    }));

    const currentPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || currentPrice;
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
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch real stock data');
  }
};

// Real news fetching using GNews API
export const fetchNewsData = async (symbol: string) => {
  try {
    console.log(`Fetching real news for ${symbol}`);
    
    // Search for news related to the stock symbol
    const articles = await gnews.search({
      q: `${symbol} stock OR ${symbol} earnings OR ${symbol} financial`,
      max: 10
    });

    return articles.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      sentiment: 0 // Will be calculated by analyzeSentiment
    }));
  } catch (error) {
    console.error('Error fetching news data:', error);
    
    // Fallback: Return minimal news structure if API fails
    return [{
      title: `${symbol} - News currently unavailable`,
      description: 'Please check your GNews API configuration',
      url: '#',
      publishedAt: new Date().toISOString(),
      source: 'System',
      sentiment: 0
    }];
  }
};

// Get comprehensive stock analysis with real data
export const getStockAnalysis = async (symbol: string) => {
  try {
    console.log(`Getting real comprehensive analysis for ${symbol}`);
    
    const [stockData, newsData] = await Promise.all([
      fetchStockData(symbol),
      fetchNewsData(symbol)
    ]);
    
    const sentiment = analyzeSentiment(newsData);
    
    // Generate trading recommendation based on real data
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
