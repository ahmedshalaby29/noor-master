import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";


async function fetchTeacher() {
  const { data } = await axios.get("api/users");

  return (data ).map((d) => ({
    ...d,
    created: new Date(d.created),
  }));
}

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchTeacher().then(setTeachers);
  }, []);

  const deleteTeacher = async (id) => {
    await axios.delete(`/api/user/${id}`);
    setTeachers((teachers) => teachers.filter((t) => t.id != id));
  };

  const makePro = async (id) => {
    await axios.post(`/api/pro/${id}`);
    setTeachers((teachers) =>
      teachers.map((t) => {
        if (t.id == id) t.isPro = true;
        return t;
      })
    );
  };

  const makeFree = async (id) => {
    await axios.post(`/api/free/${id}`);
    setTeachers((teachers) =>
      teachers.map((t) => {
        if (t.id == id) t.isPro = false;
        return t;
      })
    );
  };

  const visibleTeacher = useMemo(() => {
    if (!search) return teachers;
    else
      return teachers.filter((t) => {
        if (
          t.name.includes(search) ||
          t.uid.includes(search) ||
          t.created.toDateString().includes(search)
        )
          return true;
        if (search.includes("pro") || search.includes("مدفوع")) return t.isPro;
        if (search.includes("fre") || search.includes("مجاني")) return !t.isPro;
      });
  }, [teachers, search]);

  return (
    <div className="min-h-screen w-full border-t-4 border-indigo-400 bg-indigo-50 py-4">
      <div className="mx-auto max-w-lg px-4 sm:px-0 lg:max-w-3xl">
        <div className="flex justify-between">
          <Link
            to="builder"
            className="flex items-center justify-center rounded-md bg-gray-800 px-4 text-sm font-bold tracking-wide text-white hover:bg-indigo-500"
          >
            <span>التصميم</span>
          </Link>
          <h1 className="items-center text-lg font-semibold text-zinc-800">
            لوحة التحكم
          </h1>
        </div>
        <div
          className="mt-8 -ml-2  rounded-md bg-white p-2 shadow"
          style={{ direction: "rtl" }}
        >
          <p className="sm:hidden">المعلمين</p>

          <div className="flex items-center justify-between border-b-4 border-zinc-100 pb-6 pt-3">
            <p className="hidden sm:block">المعلمين</p>
            <input
              placeholder="بحث"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md p-1 pr-3 text-right shadow-md outline-none ring-indigo-400 ring-offset-1 selection:bg-indigo-300 selection:text-indigo-700 focus:ring-2"
            />
            <div className="text-in rounded-full bg-indigo-100 px-2 text-xs font-medium">
              {visibleTeacher.length} معلم
            </div>
          </div>

          <div className="mt-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 text-right">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-indigo-900 sm:pl-6"
                      >
                        الاسم
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 lg:table-cell"
                      >
                        وقت انشاء الحساب
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-500 lg:table-cell"
                      >
                        دخول
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                      >
                        نوع الحساب
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">حذف</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTeacher.map((item) => (
                      <tr key={item.id}>
                        <td className="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="text-ellipsis font-medium text-indigo-900">
                            {item.name}
                          </div>
                          <div className="mt-1 flex flex-col text-xs text-gray-500 sm:block lg:hidden">
                            <span className="font-mono">{item.uid}</span> -
                            <span> {item.password}</span>
                          </div>
                        </td>
                        <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">
                          {item.created.toDateString()}
                        </td>

                        <td className="relative hidden px-3 py-3.5 text-xs text-gray-500 lg:table-cell">
                          <p className="font-mono">{item.uid}</p>
                          <p>{item.password}</p>
                        </td>
                        <td className="px-3 py-3.5 text-sm font-medium">
                          {item.isPro && (
                            <span className="rounded-full bg-green-200  py-1 px-4">
                              pro
                            </span>
                          )}
                          {!item.isPro && (
                            <span className="rounded-full bg-gray-200  py-1 px-4">
                              free
                            </span>
                          )}
                        </td>
                        <td className="relative  py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() =>
                              item.isPro ? makeFree(item.id) : makePro(item.id)
                            }
                            type="button"
                            className="inline-flex items-center rounded-md border border-green-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-green-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            {item.isPro && "مجاني"}
                            {!item.isPro && "مدفوع"}
                          </button>
                          <span> </span>
                          <button
                            onClick={() => deleteTeacher(item.id)}
                            type="button"
                            className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-red-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
