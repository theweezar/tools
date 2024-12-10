import numpy as np
import matplotlib.pyplot as plt
import pandas
import os
import indicator

# Linear regression: Calculate slope (m) and intercept (b)
def show_trendline(this_plt, x_nd_timestamps, y_prices_nd_array):
    m, b = np.polyfit(x_nd_timestamps, y_prices_nd_array, 1)
    trendline = m * x_nd_timestamps + b
    this_plt.plot(x_nd_timestamps, trendline, label="Trendline", color="red")

def show_standard_chart(this_plt, x_nd_timestamps, y_prices_nd_array):
    this_plt.plot(x_nd_timestamps, y_prices_nd_array, label="Prices")
    this_plt.set_xlabel("Time (Index)")
    this_plt.set_ylabel("Price")
    this_plt.grid()
    this_plt.legend()

def show_rsi(this_plt, x_nd_timestamps, y_prices_nd_array):
    period = 7
    price_count = len(y_prices_nd_array)
    upper = np.full(price_count, 80)
    lower = np.full(price_count, 20)
    price_series = pandas.Series(y_prices_nd_array)
    rsi = indicator.calc_rsi(price_series, period)
    rsi_nd_array = np.array(rsi)
    this_plt.plot(x_nd_timestamps, rsi_nd_array, label="RSI")
    this_plt.plot(x_nd_timestamps, upper, color="blue")
    this_plt.plot(x_nd_timestamps, lower, color="blue")
    this_plt.set_xlabel(f"RSI({period})")
    this_plt.set_ylabel("Index")

    show_trendline(this_plt, x_nd_timestamps, rsi_nd_array)


# Read CSV or fetch data from API
cwd = os.getcwd()
csv_path = os.path.join(cwd, "ignore", "binance", "export_20241209233803_binance_BTCUSDT_5m.csv")
frame = pandas.read_csv(csv_path, sep=",")

# Initial price data
prices = frame['Close Price']
timestamps = range(len(prices))  # Numerical indices for time points
x_timestamps = np.array(timestamps)
y_prices = np.array(prices)

# Plot 2 charts, plot the prices and the trendline
f, axs = plt.subplots(2, 1, sharex='col', layout='constrained')

show_standard_chart(axs[0], x_timestamps, y_prices)
show_trendline(axs[0], x_timestamps, y_prices)

show_rsi(axs[1], x_timestamps, y_prices)

plt.show()
