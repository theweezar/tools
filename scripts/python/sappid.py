import pandas as pd
import sys

def write(file_name: str, input_data):
    input_file = open(file_name, "w+")
    input_file.write(input_data)
    input_file.close()

def main():
    argv = sys.argv
    csv_file = argv[-1]

    df = pd.read_csv(csv_file, delimiter=",")
    
    df_values = df.values.tolist()
    
    pids = ""

    for value in df_values:
        col = value
        sap = col[0]
        pid = "tu" + "-" + sap[:-4] + "-" + sap[-4:]
        pids += pid + "\n"

    xml_file_name = csv_file.split(".")[0]

    write(xml_file_name + ".txt", pids)

if __name__ == "__main__":
    main()