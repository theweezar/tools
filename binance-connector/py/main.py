import numpy as np
import pandas
import os
from view import View

# Read CSV or fetch data from API
cwd = os.getcwd()
csv_path = os.path.join(cwd, "ignore", "binance", "export_20241209233803_binance_BTCUSDT_5m.csv")
frame = pandas.read_csv(csv_path, sep=",")

# Initial price data
y_prices = np.array(frame['Close Price'])

# Plot 2 charts, plot the prices and the trendline
view = View(2, y_prices)

view.get_chart(0).show_standard_chart().show_trendline()

view.get_chart(1).show_rsi(7).show_trendline()

view.show()