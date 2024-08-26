import pandas as pd
import sys

def write(file_name: str, input_data):
    input_file = open(file_name, "w+")
    input_file.write(input_data)
    input_file.close()

def main():
    argv = sys.argv
    csv_file = argv[-1]
    # print(f"Reading {csv_file} ...")

    df = pd.read_csv(csv_file, delimiter=",")
    
    df_values = df.values.tolist()
    # df_values = df.sort_values(by=["position"]).values.tolist()

    # print(df.values.tolist())
    # print("\n\n")
    # print(df.sort_values(by=["position"]).values.tolist())

    cat_id = input("Input category id: ")

    xml = """<?xml version="1.0" encoding="UTF-8"?>\n"""\
        f"""<catalog xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="kr-tumi">\n"""

    for value in df_values:
        col = value

        xml_child = f"""\t<category-assignment category-id="{cat_id}" product-id="{col[0]}">\n"""\
                f"""\t\t<position>auto</position>\n"""\
            f"""\t</category-assignment>\n"""

        # xml_child = f"""\t<category-assignment category-id="{cat_id}" product-id="{col[0]}" />\n"""

        xml += xml_child
        # print(xml_child)

    xml += """</catalog>"""

    print(xml)

    xml_file_name = csv_file.split(".")[0]
    write(xml_file_name + ".xml", xml)


if __name__ == "__main__":
    main()