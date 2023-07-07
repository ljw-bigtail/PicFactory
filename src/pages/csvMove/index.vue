<template>
  <BaseLayout>
    <template v-slot:header>
      <span>商品迁移工具</span>
    </template>
    <!-- <template v-slot:menu> </template> -->
    <template v-slot:main>
      <div class="center">
        <header>
          <h3>商品迁移工具</h3>
          <p>
            现已支持：
            {{ selectOption.map((e) => e.name.toLocaleUpperCase()).join("、") }}
            平台互相导入导出
          </p>
        </header>
        <div>
          <DropFile
            v-model:value="files"
            :max_size="1024 * 50"
            @change="handleFileChange"
            ref="dropFile"
            :multiple="false"
            :file_type="['text/csv']"
          />
        </div>
        <ul class="filsList">
          <li>
            <span>{{ uploadFileName }}</span>
            <span>{{ uploadFileSize }}KB</span>
          </li>
        </ul>
        <div class="form">
          <div class="form-item">
            <span>
              上传的文件为
              <strong>{{ uploadFileType }}</strong>
              商品数据，
              <br />
              请选择想导出的平台：
            </span>
            <select @change="selectHandler" v-model="targetType">
              <option
                :key="opt.value"
                :value="opt.value"
                v-for="opt in selectOption"
                :disabled="opt.value === uploadFileType"
              >
                {{ opt.name.toLocaleUpperCase() }}
              </option>
            </select>
          </div>
        </div>
        <div class="btn-group center">
          <button class="button D large" @click="handleConversion">
            导出{{ targetType.toLocaleUpperCase() }}
          </button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, Ref, inject } from "vue";
// import csv2json from "csvjson-csv2json";
// @ts-ignore
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { dateFmt } from "@/utils/utils";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { DropFile } from "@/components/index";
import Log from "@/fragment/Log.vue";
import { dropFileType } from "@/type/dropFile";
import { log } from "console";

const logs = ref([] as { value: string; timestamp: string }[]);
const message = inject("_message") as Function;

const selectOption = ref([
  { name: "shopline", value: "shopline" },
  { name: "shopify", value: "shopify" },
]);
const targetType = ref(selectOption.value[0].value);
const selectHandler = () => {};

const files: Ref<dropFileType[]> = ref([]);
const uploadFileType = ref("--");
const uploadFileName = ref("--");
const uploadFileSize = ref("0");
let csvCache: {}[] = [];

const handleFileChange = async (_files: dropFileType[]) => {
  const file = { ...[...files.value][0] }.file;

  let name: string[] = file.name.split(".");
  name.pop();
  uploadFileName.value = name.join(".");
  uploadFileSize.value = (file.size / 1000).toFixed(0);

  const csv = await readCSV(file);
  const csv_title = csv[0];
  if (Object.keys(csv_title).includes("Product description html")) {
    uploadFileType.value = selectOption.value[0].value;
  } else if (Object.keys(csv_title).includes("Body (HTML)")) {
    uploadFileType.value = selectOption.value[1].value;
  } else {
    message({
      type: "warning",
      value: `上传的文件未被识别，请联系博主...`,
    });
    files.value = [];
    return false;
  }
  targetType.value = selectOption.value.filter(
    (item) => item.value != uploadFileType.value
  )[0].value;
  files.value = [];
  csvCache = csv;
};

const readCSV = async (file: File): Promise<{}[]> => {
  return new Promise((res, rej) => {
    Papa.parse(file, {
      dynamicTyping: false,
      complete: (results: any) => {
        const json: {}[] = [];
        const keys = results.data[0];
        results.data.forEach((item: string[], index: number) => {
          if (index > 0 && item.length == keys.length) {
            const data: any = {};
            keys.forEach((_item: string, _index: number) => {
              data[_item] = (item[_index] || "").replace(/\t/g, "");
            });
            json.push(data);
          }
        });
        res(json);
      },
      error: (err: any) => {
        message({
          type: "warning",
          value: `上传的文件未被识别，请联系博主...`,
        });
      },
    });
  });
};

const shopifyTiles = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Option4 Name",
  "Option4 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Google Shopping / Google Product Category",
  "Google Shopping / Gender",
  "Google Shopping / Age Group",
  "Google Shopping / MPN",
  "Google Shopping / Condition",
  "Google Shopping / Custom Product",
  "Google Shopping / Custom Label 0",
  "Google Shopping / Custom Label 1",
  "Google Shopping / Custom Label 2",
  "Google Shopping / Custom Label 3",
  "Google Shopping / Custom Label 4",
  "Variant Image",
  "Variant Weight Unit",
  "Variant Tax Code",
  "Cost per item",
];

const shoplineTiles = [
  "spuid",
  "Handle",
  "Title*",
  "Subtitle",
  "Product description html",
  "SPU",
  "Vendor",
  "Tags",
  "Collections",
  "Master image",
  "SEO title",
  "SEO description",
  "SEO keywords",
  "Published",
  "Status",
  "Standardized Product Type",
  "Custom Product Type",
  "Created time",
  "SKU",
  "Option1 name",
  "Option1 value",
  "Option2 name",
  "Option2 value",
  "Option3 name",
  "Option3 value",
  "Option4 name",
  "Option4 value",
  "Option5 name",
  "Option5 value",
  "Image",
  "SKU price",
  "SKU compare at price",
  "SKU weight",
  "SKU weight unit",
  "SKU Inventory Tracker",
  "SKU Inventory Policy",
  "SKU Inventory Quantity",
  "Cost per item",
  "Barcode (ISBN,UPC,GTIN,etc.)",
  "SKU tax policy",
  "SKU shipping policy",
  "Google Shopping / Google Product Category",
  "Google Shopping / Gender",
  "Google Shopping / Age Group",
  "Google Shopping / MPN",
  "Google Shopping / AdWords Grouping",
  "Google Shopping / AdWords Labels",
  "Google Shopping / Condition",
  "Google Shopping / Custom Product",
  "Google Shopping / Custom Label 0",
  "Google Shopping / Custom Label 1",
  "Google Shopping / Custom Label 2",
  "Google Shopping / Custom Label 3",
  "Google Shopping / Custom Label 4",
];

function arrayToCsv(data: {}[], type: string) {
  let outArr: {
    fields: string[];
    data: string[][];
  } = {
    fields: [],
    data: [],
  };
  switch (type) {
    case "shopline":
      // TODO
      // outArr.fields = shoplineTiles;
      // outArr.data = data.map((item) => {
      //   return [];
      // });
      break;
    case "shopify":
      outArr.fields = shopifyTiles;
      outArr.data = data.map((item: any, index: number) => {
        return shopifyTiles.map((key) => {
          let value = "";
          switch (key) {
            case "Title":
              value = item["Title*"];
              break;
            case "Body (HTML)":
              value = item["Product description html"];
              break;
            // case "Product Category":
            //   value = item["Collections"];
            //   break;
            case "Published":
              value = "TRUE";
              break;
            case "Option1 Name":
              value = item["Option1 name"];
              break;
            case "Option1 Value":
              value = item["Option1 value"];
              break;
            case "Option2 Name":
              value = item["Option2 name"];
              break;
            case "Option2 Value":
              value = item["Option2 value"];
              break;
            case "Option3 Name":
              value = item["Option3 name"];
              break;
            case "Option3 Value":
              value = item["Option3 value"];
              break;
            case "Variant SKU":
              value = item["SKU"];
              break;
            case "Variant Grams":
              value = "300";
              break;
            case "Variant Inventory Tracker":
              value = "shopify";
              break;
            case "Variant Inventory Qty":
              value =
                item["SKU Inventory Quantity"] && item["SKU Inventory Quantity"] != 0
                  ? item["SKU Inventory Quantity"]
                  : "500";
              break;
            case "Variant Inventory Policy":
              value = "continue";
              break;
            case "Variant Fulfillment Service":
              value = "manual";
              break;
            case "Variant Price":
              value = item["SKU price"];
              break;
            case "Variant Compare At Price":
              value =
                item["SKU compare at price"] && item["SKU compare at price"] != "0"
                  ? item["SKU compare at price"]
                  : item["SKU price"];
              break;
            case "Variant Requires Shipping":
              value = "TRUE";
              break;
            case "Variant Taxable":
              value = "FALSE";
              break;
            case "Variant Barcode":
              value = item["Barcode (ISBN,UPC,GTIN,etc.)"];
              break;
            case "Image Src":
              value = item["Master image"];
              break;
            case "Image Position":
              value = item["Master image"] ? (index + 1).toString() : "";
              break;
            case "Image Alt Text":
              value = item["Title*"] + item["Tags"];
              break;
            case "Gift Card":
              value = "FALSE";
              break;
            case "SEO Title":
              value = item["SEO title"];
              break;
            case "SEO Description":
              value = item["SEO description"];
              break;
            case "Variant Image":
              value = item["Image"];
              break;
            case "Variant Weight Unit":
              value = "g";
              break;
            default:
              value = item[key];
              break;
          }
          return value && value != "" ? value : "";
        });
      });
      break;
  }
  return outArr;
}

const handleConversion = async () => {
  if (csvCache.length === 0) {
    message({
      type: "error",
      value: "数据为空！",
    });
    return false;
  }

  // const outCSV = json2csv.json2csv(outArr);
  const outCSVArr = arrayToCsv(csvCache, targetType.value);
  const outCSV = Papa.unparse(outCSVArr);

  const BOM = "\uFEFF";
  const csvBlob = new Blob([BOM + outCSV], { type: "text/csv;charset=utf-8;" });
  await saveAs(csvBlob, `${targetType.value}-${uploadFileName.value}.csv`);
  console.log(`${targetType.value}-${uploadFileName.value}.csv`);

  message({
    type: "success",
    value: "下载成功...",
  });
};
</script>

<style lang="less" scoped>
.center {
  width: 750px;
  header {
    padding: 2rem 0;
    h3 {
      padding: 1rem 0;
    }
    p {
      color: var(--color-dark-gray);
    }
  }
  .form {
    padding: 1rem 0;
    .form-item {
      line-height: 1.8em;
    }
    select {
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius);
    }
  }
  .filsList {
    margin: 1rem 0;
    li {
      display: flex;
      line-height: 1.4;
      justify-content: space-between;
      padding: 0.6rem 0;
      span:first-child {
        text-align: left;
        width: 70%;
        display: block;
        overflow: hidden;
      }
    }
  }
}
</style>
