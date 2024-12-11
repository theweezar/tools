import numpy as np
import pandas

a = np.array([])

b = pandas.Series(a)

print(type(b) == np.ndarray)
