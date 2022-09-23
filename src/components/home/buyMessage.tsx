/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";
import { CheckCircle } from "react-feather";
import Repository from "../../repository";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const includedFeatures = [
  "رصد كل المهارات والدرجات بضغطة زر واحدة",
  "دخول من أي شاشة أيفون أو أندرويد أو حاسوب",
  "تقارير مرصودة و فارغة للطلاب والفصول",
  "مزايا أخرى اكتشفها داخل الموقع"
];

const PaypalClientId =
  "AV4gQ-jSryV-9cAV5Sgkl1HP0xcuybQ4Zds1L9Whez5jZsRFrpswaWVyOGa5xtlDpyVywgHoiS9LtaSM";

export type Prices = {
  pro: number;
  title: string;
  price: number;
}[];

export default function Example() {
  const [price, setPrice] = useState<Prices>();
  useEffect(() => {
    Repository.instance.getPrice().then(setPrice);
  }, []);

  const createOrder = async (price: number) => {
    return (await Repository.instance.createPaypalOrder(price)).id;
  };

  const handleOrder = async (id: any, price: number) => {
    return await Repository.instance.paypalHandleOrder(id, price);
  };

  return (
    <div className="bg-gray-100">
      <div className="pt-6 sm:pt-8 lg:pt-16 font-arabic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              اشتري الان
            </h2>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-gray-100" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none flex flex-col">
              <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                <h3 className="text-2xl text-right font-extrabold text-gray-900 sm:text-3xl">
                  اشترك في ارصد نور
                </h3>

                <div className="mt-8">
                  <div className="flex flex-row-reverse items-center">
                    <h4 className="flex-shrink-0 pl-4 bg-white text-sm tracking-wider font-semibold uppercase text-indigo-600">
                      المميزات
                    </h4>
                    <div className="flex-1 border-t-2 border-gray-200" />
                  </div>
                  <ul
                    style={{ direction: "rtl" }}
                    role="list"
                    className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5"
                  >
                    {includedFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start lg:col-span-1"
                      >
                        <div className="flex-shrink-0">
                          <CheckCircle
                            className="h-5 w-5 text-green-400"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mr-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="py-8 px-6 space-y-12 lg:space-x-12 lg:space-y-0 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:justify-center lg:p-12">
                {price?.map((p) => (
                  <div key={p.price}>
                    <h3 className="text-xl text-center font-semibold text-gray-900 sm:text-3xl">
                      {p.title}
                    </h3>
                    <PayPalScriptProvider
                      options={{ "client-id": PaypalClientId }}
                    >
                      <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                        <span>${p.price}</span>
                        <span className="ml-3 text-xl font-medium text-gray-500">
                          USD
                        </span>
                      </div>

                      <div className="mt-6">
                        <PayPalButtons
                          key={p.price}
                          createOrder={() => createOrder(p.price)}
                          onApprove={(data) =>
                            handleOrder(data.orderID, p.price)
                          }
                          className=" shadow flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-100 hover:bg-indigo-400"
                        >
                          <span>ادفع الان</span>
                        </PayPalButtons>
                      </div>
                    </PayPalScriptProvider>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
