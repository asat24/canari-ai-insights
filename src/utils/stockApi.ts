
// Browser-compatible stock API implementation
// Using Alpha Vantage API for real stock data (free tier available)

// Simple sentiment analysis function (browser-compatible alternative to vader-sentiment)
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

// Real stock data fetching using Alpha Vantage API (browser-compatible)
export const fetchStockData = async (symbol: string) => {
  try {
    console.log(`Fetching real stock data for ${symbol}`);
    
    // You can get a free API key from https://www.alphavantage.co/support/#api-key
    const API_KEY = 'demo'; // Replace with your actual API key
    
    // Fetch current quote
    const quoteResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const quoteData = await quoteResponse.json();
    
    // Fetch daily data for chart
    const dailyResponse = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}`
    );
    const dailyData = await dailyResponse.json();
    
    // Handle API limit or demo data
    if (quoteData['Error Message'] || dailyData['Error Message'] || API_KEY === 'demo') {
      // Return demo data when API limit is reached or using demo key
      return generateDemoStockData(symbol);
    }
    
    const quote = quoteData['Global Quote'];
    const timeSeries = dailyData['Time Series (Daily)'];
    
    if (!quote || !timeSeries) {
      return generateDemoStockData(symbol);
    }
    
    // Format chart data from last 30 days
    const chartData = Object.entries(timeSeries)
      .slice(0, 30)
      .reverse()
      .map(([date, data]: [string, any]) => ({
        time: new Date(date).toLocaleDateString(),
        price: Number(parseFloat(data['4. close']).toFixed(2))
      }));

    const currentPrice = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
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
    // Fallback to demo data
    return generateDemoStockData(symbol);
  }
};

// Generate realistic demo data for development/testing
const generateDemoStockData = (symbol: string) => {
  const basePrice = Math.random() * 200 + 50; // Random price between 50-250
  const change = (Math.random() - 0.5) * 10; // Random change between -5 to +5
  const changePercent = (change / basePrice) * 100;
  
  // Generate 30 days of chart data
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const priceVariation = (Math.random() - 0.5) * 20;
    return {
      time: date.toLocaleDateString(),
      price: Number((basePrice + priceVariation).toFixed(2))
    };
  });
  
  return {
    symbol,
    currentPrice: Number(basePrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    chartData
  };
};

// News fetching using NewsAPI (browser-compatible)
export const fetchNewsData = async (symbol: string) => {
  try {
    console.log(`Fetching real news for ${symbol}`);
    
    // You can get a free API key from https://newsapi.org/
    const API_KEY = 'demo'; // Replace with your actual NewsAPI key
    
    if (API_KEY === 'demo') {
      // Return demo news data
      return generateDemoNewsData(symbol);
    }
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol} stock&language=en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
      return generateDemoNewsData(symbol);
    }
    
    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      sentiment: analyzeSentimentSimple(article.title + ' ' + (article.description || ''))
    }));
  } catch (error) {
    console.error('Error fetching news data:', error);
    return generateDemoNewsData(symbol);
  }
};

// Generate demo news data
const generateDemoNewsData = (symbol: string) => {
  const demoNews = [
    {
      title: `${symbol} Reports Strong Q4 Earnings, Beats Expectations`,
      description: `${symbol} announced quarterly results that exceeded analyst expectations with strong revenue growth.`,
      url: '#',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      source: 'Financial Times',
      sentiment: 0.3
    },
    {
      title: `Market Analysis: ${symbol} Stock Shows Positive Momentum`,
      description: `Technical analysis suggests ${symbol} may be entering a bullish phase with strong support levels.`,
      url: '#',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      source: 'MarketWatch',
      sentiment: 0.2
    },
    {
      title: `${symbol} Announces New Strategic Partnership`,
      description: `The company has formed a strategic alliance that could drive future growth and market expansion.`,
      url: '#',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      source: 'Reuters',
      sentiment: 0.15
    },
    {
      title: `Analyst Upgrades ${symbol} Rating to Buy`,
      description: `Leading investment firm raises price target and upgrades rating citing strong fundamentals.`,
      url: '#',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      source: 'Bloomberg',
      sentiment: 0.25
    }
  ];
  
  return demoNews;
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
