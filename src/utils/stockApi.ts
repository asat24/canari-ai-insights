
// Client-side stock data fetching and analysis utilities

// Enhanced sentiment analysis (replacing vader-sentiment for client-side)
export const analyzeSentiment = (articles: any[]) => {
  if (!articles || articles.length === 0) {
    return { score: 0, summary: 'No sentiment data available' };
  }

  // Expanded sentiment word lists with weights
  const sentimentWords = {
    positive: {
      'bull': 0.8, 'bullish': 0.8, 'surge': 0.7, 'soar': 0.7, 'rally': 0.6,
      'gain': 0.5, 'gains': 0.5, 'profit': 0.6, 'profits': 0.6, 'growth': 0.5,
      'rise': 0.4, 'rising': 0.4, 'up': 0.3, 'increase': 0.4, 'strong': 0.5,
      'buy': 0.6, 'upgrade': 0.7, 'outperform': 0.6, 'beat': 0.5, 'beats': 0.5,
      'positive': 0.4, 'optimistic': 0.5, 'confident': 0.4, 'success': 0.5,
      'excellent': 0.7, 'outstanding': 0.8, 'breakthrough': 0.7, 'innovation': 0.5
    },
    negative: {
      'bear': 0.8, 'bearish': 0.8, 'crash': 0.9, 'plunge': 0.8, 'tumble': 0.7,
      'fall': 0.5, 'falling': 0.5, 'drop': 0.5, 'decline': 0.5, 'loss': 0.6,
      'losses': 0.6, 'down': 0.3, 'decrease': 0.4, 'weak': 0.5, 'sell': 0.6,
      'downgrade': 0.7, 'underperform': 0.6, 'miss': 0.5, 'misses': 0.5,
      'negative': 0.4, 'concern': 0.4, 'concerns': 0.4, 'risk': 0.5, 'risks': 0.5,
      'warning': 0.6, 'challenge': 0.4, 'challenges': 0.4, 'trouble': 0.6
    }
  };

  let totalScore = 0;
  let analyzedCount = 0;

  articles.forEach(article => {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    let articleScore = 0;
    
    // Check positive words
    Object.entries(sentimentWords.positive).forEach(([word, weight]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        articleScore += (weight as number) * matches.length;
      }
    });
    
    // Check negative words
    Object.entries(sentimentWords.negative).forEach(([word, weight]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) {
        articleScore -= (weight as number) * matches.length;
      }
    });
    
    totalScore += articleScore;
    analyzedCount++;
  });

  const avgScore = analyzedCount > 0 ? totalScore / analyzedCount : 0;
  
  return {
    score: Math.max(-1, Math.min(1, avgScore)), // Clamp between -1 and 1
    summary: avgScore > 0.2 ? 'Positive' : avgScore < -0.2 ? 'Negative' : 'Neutral'
  };
};

// Enhanced stock data fetching with realistic mock data
export const fetchStockData = async (symbol: string) => {
  try {
    console.log(`Fetching enhanced stock data for ${symbol}`);
    
    // Enhanced mock data with more realistic patterns
    const basePrice = 100 + Math.random() * 300; // Price between $100-$400
    const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
    const trend = (Math.random() - 0.5) * 0.1; // -5% to +5% trend
    
    // Generate realistic intraday data (last 6 hours)
    const chartData = [];
    let currentPrice = basePrice;
    const now = new Date();
    
    for (let i = 0; i < 360; i += 5) { // Every 5 minutes for 6 hours
      const time = new Date(now.getTime() - (360 - i) * 60000);
      
      // Add realistic price movement
      const randomChange = (Math.random() - 0.5) * volatility * currentPrice;
      const trendChange = trend * currentPrice / 360;
      currentPrice += randomChange + trendChange;
      
      chartData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: Number(currentPrice.toFixed(2))
      });
    }

    const dayChange = currentPrice - basePrice;
    const changePercent = (dayChange / basePrice) * 100;

    return {
      symbol,
      currentPrice: Number(currentPrice.toFixed(2)),
      change: Number(dayChange.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      chartData: chartData.slice(-50) // Last 50 data points for performance
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch stock data');
  }
};

// Enhanced news fetching with realistic mock data
export const fetchNewsData = async (symbol: string) => {
  try {
    console.log(`Fetching enhanced news for ${symbol}`);
    
    // Simulate realistic news articles
    const newsSources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance', 'Financial Times'];
    const newsTypes = [
      'earnings', 'analysis', 'upgrade', 'downgrade', 'merger', 'acquisition',
      'regulatory', 'market', 'innovation', 'partnership'
    ];
    
    const mockNews = [];
    const numArticles = 6 + Math.floor(Math.random() * 6); // 6-12 articles
    
    for (let i = 0; i < numArticles; i++) {
      const source = newsSources[Math.floor(Math.random() * newsSources.length)];
      const newsType = newsTypes[Math.floor(Math.random() * newsTypes.length)];
      const timeAgo = Math.floor(Math.random() * 3600000 * 12); // Up to 12 hours ago
      
      // Generate realistic headlines
      const headlines = {
        earnings: [
          `${symbol} Reports Strong Q4 Earnings, Beats Wall Street Expectations`,
          `${symbol} Revenue Jumps 15% in Latest Quarter, Shares Rally`,
          `${symbol} Posts Record Quarterly Profits, Raises Full-Year Guidance`
        ],
        analysis: [
          `Market Analysis: Why ${symbol} Could Be the Top Pick This Quarter`,
          `${symbol} Technical Analysis: Key Support and Resistance Levels`,
          `Investment Outlook: ${symbol} Fundamentals Remain Strong`
        ],
        upgrade: [
          `Major Bank Upgrades ${symbol} to 'Buy' Rating, Raises Price Target`,
          `${symbol} Gets Rating Boost from Top Analysts Following Strong Performance`,
          `Wall Street Bullish on ${symbol}: Multiple Upgrades This Week`
        ],
        innovation: [
          `${symbol} Unveils Revolutionary Technology That Could Transform Industry`,
          `${symbol} Patents Breakthrough Innovation, Stock Surges on News`,
          `${symbol} R&D Investment Pays Off with Major Product Launch`
        ]
      };
      
      const headlineOptions = headlines[newsType as keyof typeof headlines] || [
        `${symbol} Makes Headlines with Latest Development`,
        `${symbol} in Focus: Latest Market Updates`
      ];
      
      const title = headlineOptions[Math.floor(Math.random() * headlineOptions.length)];
      
      // Generate sentiment based on news type
      let sentiment = 0;
      switch (newsType) {
        case 'earnings':
        case 'upgrade':
        case 'innovation':
          sentiment = 0.3 + Math.random() * 0.5; // Positive
          break;
        case 'downgrade':
        case 'regulatory':
          sentiment = -0.3 - Math.random() * 0.4; // Negative
          break;
        default:
          sentiment = (Math.random() - 0.5) * 0.6; // Mixed
      }
      
      mockNews.push({
        title,
        description: `Latest developments regarding ${symbol} and market analysis. Professional insights and expert commentary on recent activities.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-${newsType}-${Date.now() + i}`,
        publishedAt: new Date(Date.now() - timeAgo).toISOString(),
        source,
        sentiment: Number(sentiment.toFixed(2))
      });
    }
    
    // Sort by publish time (newest first)
    return mockNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw new Error('Failed to fetch news data');
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
    
    // Generate trading recommendation
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
