import util
import numpy as np
from view import View
from matplotlib.pylab import figtext

# https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html
# https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html


# Initial price data
csv = util.get_csv()
frame = csv["data_frame"]
symbol = frame["Symbol"][0]
y_prices = np.array(frame["Close"])
y_vols = np.array(frame["Volume"])

# Plot 2 charts, plot the prices and the trendline
view = View(3, y_prices)

view.get_chart(0).show_chart(xlabel=f"{symbol} Last").show_trendline().show_ema(34, "#FFA500").show_ema(89, "green")

view.get_chart(1).show_rsi(7).show_trendline()

view.get_chart(2).set_initial_nd_array(y_vols).show_chart(xlabel="VOL Last", ylabel="VOL").show_trendline()

figtext(
    0, 0,
    """
    ema(34): orange, ema(89): green
    """
)

view.show()