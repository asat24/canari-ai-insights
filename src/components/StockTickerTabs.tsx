
import React from 'react';
import { Button } from '@/components/ui/button';

interface Stock {
  symbol: string;
  name: string;
}

interface StockTickerTabsProps {
  stocks: Stock[];
  selectedStock: string;
  onStockSelect: (symbol: string) => void;
}

const StockTickerTabs: React.FC<StockTickerTabsProps> = ({ 
  stocks, 
  selectedStock, 
  onStockSelect 
}) => {
  return (
    <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {stocks.map((stock) => (
            <Button
              key={stock.symbol}
              onClick={() => onStockSelect(stock.symbol)}
              variant="ghost"
              size="sm"
              className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 ${
                selectedStock === stock.symbol
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{stock.symbol}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockTickerTabs;
