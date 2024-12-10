import pandas
import math

def calc_rsi(prices: pandas.Series, period: int):
    """ Calculate RSI

    Args:
        prices (Series): Close price series
        period (int): Period

    Returns:
        Series: RSI Series
    """
    
    # Calc diff = Curr price - Prev price
    diff_prices = prices.diff()

    # Separate gains and losses
    gains = diff_prices.where(diff_prices > 0, 0)
    losses = -diff_prices.where(diff_prices < 0, 0)

    # Calculate the initial average gain and average loss
    avg_gain = gains.rolling(window=period, min_periods=period).mean()
    avg_loss = losses.rolling(window=period, min_periods=period).mean()

    # Calculate smoothed averages for subsequent periods
    for i in range(period, len(prices)):
        avg_gain[i] = ((avg_gain[i-1] * (period - 1)) + gains[i]) / period
        avg_loss[i] = ((avg_loss[i-1] * (period - 1)) + losses[i]) / period

    # Calculate Relative Strength (RS)
    rs = avg_gain / avg_loss

    # Calculate RSI
    rsi = 100 - (100 / (1 + rs))
    rsi = rsi.map(lambda val: 50 if math.isnan(val) else val)

    return rsi
