
// Client-side stock data fetching and analysis utilities

// Mock sentiment analysis (replacing vader-sentiment for client-side)
export const analyzeSentiment = (articles: any[]) => {
  if (!articles || articles.length === 0) {
    return { score: 0, summary: 'No sentiment data available' };
  }

  // Simple sentiment analysis based on keywords
  const positiveWords = ['up', 'rise', 'gain', 'profit', 'growth', 'bull', 'strong', 'buy', 'positive', 'increase'];
  const negativeWords = ['down', 'fall', 'loss', 'drop', 'bear', 'weak', 'sell', 'negative', 'decrease', 'crash'];

  let totalScore = 0;
  let analyzedCount = 0;

  articles.forEach(article => {
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.1;
    });
    
    totalScore += score;
    analyzedCount++;
  });

  const avgScore = analyzedCount > 0 ? totalScore / analyzedCount : 0;
  
  return {
    score: Math.max(-1, Math.min(1, avgScore)), // Clamp between -1 and 1
    summary: avgScore > 0.2 ? 'Positive' : avgScore < -0.2 ? 'Negative' : 'Neutral'
  };
};

// Mock Yahoo Finance API (for demo purposes)
export const fetchStockData = async (symbol: string) => {
  try {
    console.log(`Fetching stock data for ${symbol}`);
    
    // For demo purposes, we'll generate mock data
    // In a real implementation, you'd use yahoo-finance2 with a CORS proxy
    const mockPrice = 150 + Math.random() * 100;
    const mockChange = (Math.random() - 0.5) * 10;
    
    // Generate mock chart data
    const chartData = [];
    let basePrice = mockPrice;
    for (let i = 0; i < 24; i++) {
      const time = new Date();
      time.setHours(time.getHours() - (24 - i));
      basePrice += (Math.random() - 0.5) * 5;
      chartData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice
      });
    }

    return {
      symbol,
      currentPrice: mockPrice,
      change: mockChange,
      changePercent: (mockChange / mockPrice) * 100,
      chartData
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch stock data');
  }
};

// Mock News API (for demo purposes)
export const fetchNewsData = async (symbol: string) => {
  try {
    console.log(`Fetching news for ${symbol}`);
    
    // For demo purposes, we'll generate mock news data
    // In a real implementation, you'd use gnews with proper API setup
    const mockNews = [
      {
        title: `${symbol} Reports Strong Q4 Earnings, Beats Expectations`,
        description: `${symbol} has announced impressive quarterly results with revenue growth exceeding analyst predictions.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-earnings`,
        publishedAt: new Date().toISOString(),
        source: 'Financial Times',
        sentiment: 0.6
      },
      {
        title: `Market Analysis: ${symbol} Shows Resilience Amid Economic Uncertainty`,
        description: `Despite market volatility, ${symbol} maintains strong fundamentals and investor confidence.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-analysis`,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Bloomberg',
        sentiment: 0.3
      },
      {
        title: `${symbol} Faces Regulatory Challenges in New Markets`,
        description: `The company is navigating complex regulatory requirements as it expands into international markets.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-regulatory`,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: 'Reuters',
        sentiment: -0.2
      },
      {
        title: `Analysts Upgrade ${symbol} Price Target Following Innovation Announcement`,
        description: `Wall Street analysts are increasingly bullish on ${symbol} following recent product innovations.`,
        url: `https://example.com/news/${symbol.toLowerCase()}-upgrade`,
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: 'CNBC',
        sentiment: 0.5
      }
    ];

    return mockNews;
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw new Error('Failed to fetch news data');
  }
};

// Function to fetch real Yahoo Finance data (requires CORS proxy in production)
export const fetchRealStockData = async (symbol: string) => {
  try {
    // Note: This would require a CORS proxy or backend service in production
    // For now, using mock data due to CORS restrictions
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const params = new URLSearchParams({
      region: 'US',
      lang: 'en-US',
      includePrePost: 'false',
      interval: '1d',
      range: '1d'
    });
    
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const data = responseData.chart.result[0];
    const meta = data.meta;
    const prices = data.indicators.quote[0];
    
    return {
      symbol,
      currentPrice: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      chartData: prices.close.map((price: number, index: number) => ({
        time: new Date(data.timestamp[index] * 1000).toLocaleTimeString(),
        price
      }))
    };
  } catch (error) {
    console.error('Error fetching real stock data:', error);
    // Fallback to mock data
    return fetchStockData(symbol);
  }
};
