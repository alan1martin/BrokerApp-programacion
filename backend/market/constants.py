# market/constants.py

USA_MARKET_SYMBOLS = [
    {"ticker": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology", "exchange": "NASDAQ"},
    {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology", "exchange": "NASDAQ"},
    {"ticker": "MSFT", "name": "Microsoft Corporation", "sector": "Technology", "exchange": "NASDAQ"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Cyclical", "exchange": "NASDAQ"},
    {"ticker": "GOOGL", "name": "Alphabet Inc. (Class A)", "sector": "Communication Services", "exchange": "NASDAQ"},
    {"ticker": "META", "name": "Meta Platforms Inc.", "sector": "Communication Services", "exchange": "NASDAQ"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Cyclical", "exchange": "NASDAQ"},
    {"ticker": "AMD", "name": "Advanced Micro Devices Inc.", "sector": "Technology", "exchange": "NASDAQ"},
    {"ticker": "INTC", "name": "Intel Corporation", "sector": "Technology", "exchange": "NASDAQ"},
    {"ticker": "SPY", "name": "SPDR S&P 500 ETF Trust", "sector": "ETF", "exchange": "AMEX"},
    {"ticker": "QQQ", "name": "Invesco QQQ Trust", "sector": "ETF", "exchange": "NASDAQ"},
    {"ticker": "DIA", "name": "SPDR Dow Jones Industrial Average ETF", "sector": "ETF", "exchange": "AMEX"},
    {"ticker": "IWM", "name": "iShares Russell 2000 ETF", "sector": "ETF", "exchange": "AMEX"},
    {"ticker": "NFLX", "name": "Netflix Inc.", "sector": "Communication Services", "exchange": "NASDAQ"},
    {"ticker": "DIS", "name": "The Walt Disney Company", "sector": "Communication Services", "exchange": "NYSE"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial Services", "exchange": "NYSE"},
    {"ticker": "V", "name": "Visa Inc.", "sector": "Financial Services", "exchange": "NYSE"},
    {"ticker": "MA", "name": "Mastercard Incorporated", "sector": "Financial Services", "exchange": "NYSE"},
    {"ticker": "KO", "name": "The Coca-Cola Company", "sector": "Consumer Defensive", "exchange": "NYSE"},
    {"ticker": "PEP", "name": "PepsiCo Inc.", "sector": "Consumer Defensive", "exchange": "NASDAQ"},
    {"ticker": "WMT", "name": "Walmart Inc.", "sector": "Consumer Defensive", "exchange": "NYSE"},
    {"ticker": "BA", "name": "The Boeing Company", "sector": "Industrials", "exchange": "NYSE"},
    {"ticker": "BABA", "name": "Alibaba Group Holding Limited", "sector": "Consumer Cyclical", "exchange": "NYSE"},
    {"ticker": "PYPL", "name": "PayPal Holdings Inc.", "sector": "Financial Services", "exchange": "NASDAQ"},
    {"ticker": "SQ", "name": "Block Inc.", "sector": "Financial Services", "exchange": "NYSE"},
]

POPULAR_TICKERS = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "SPY"]