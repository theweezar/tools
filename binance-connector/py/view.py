import matplotlib.pyplot as plt

class View:
    def __init__(self, number_of_chart):
        f, axs = plt.subplots(number_of_chart, 1, sharex='col', layout='constrained')

        self.number_of_chart = number_of_chart
        self.axs = axs

    def get_chart(self, index):
        return self.axs[index]
        