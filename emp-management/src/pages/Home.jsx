"use client"

import { useState } from "react"
import {
  BarChart,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const Home = () => {
  const [timeframe, setTimeframe] = useState("month")

  // Sample data for dashboard
  const stats = [
    {
      title: "Total Employees",
      value: "124",
      change: "+5%",
      trend: "up",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-100",
    },
    {
      title: "Total Salary",
      value: "$142,500",
      change: "+2.3%",
      trend: "up",
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      color: "bg-green-100",
    },
    {
      title: "Avg. Salary",
      value: "$1,150",
      change: "-0.5%",
      trend: "down",
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      color: "bg-purple-100",
    },
    {
      title: "Next Payday",
      value: "15 May",
      change: "3 days",
      trend: "neutral",
      icon: <Calendar className="w-8 h-8 text-red-500" />,
      color: "bg-red-100",
    },
  ]

  // Sample data for pending approvals
  const pendingApprovals = [
    { type: "Leave Request", employee: "Sarah Johnson", date: "May 10, 2023", status: "pending" },
    { type: "Overtime Approval", employee: "Michael Brown", date: "May 8, 2023", status: "pending" },
    { type: "Salary Adjustment", employee: "Robert Wilson", date: "May 5, 2023", status: "approved" },
    { type: "Leave Request", employee: "Jane Smith", date: "May 3, 2023", status: "rejected" },
  ]

  // Sample data for attendance
  const attendanceData = {
    present: 112,
    absent: 5,
    leave: 7,
    total: 124,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">Dashboard</h1>
        <div className="flex space-x-2 bg-white rounded-lg shadow-sm p-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeframe === "day" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            onClick={() => setTimeframe("day")}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeframe === "week" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            onClick={() => setTimeframe("week")}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeframe === "month" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            onClick={() => setTimeframe("month")}
          >
            Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg shadow-md p-6 transition-transform duration-300 hover:scale-105`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : stat.trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-white shadow-sm">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Today's Attendance</h2>
          </div>
          <div className="flex justify-between mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{attendanceData.present}</div>
              <div className="text-sm text-gray-500">Present</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{attendanceData.absent}</div>
              <div className="text-sm text-gray-500">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{attendanceData.leave}</div>
              <div className="text-sm text-gray-500">On Leave</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${(attendanceData.present / attendanceData.total) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 mt-2 text-center">
            {Math.round((attendanceData.present / attendanceData.total) * 100)}% attendance rate
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <BarChart className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Salary Distribution</h2>
          </div>
          <div className="h-64 flex flex-col justify-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Engineering</span>
                  <span className="text-sm font-medium text-gray-700">$45,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Marketing</span>
                  <span className="text-sm font-medium text-gray-700">$32,500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Finance</span>
                  <span className="text-sm font-medium text-gray-700">$28,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Human Resources</span>
                  <span className="text-sm font-medium text-gray-700">$22,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Sales</span>
                  <span className="text-sm font-medium text-gray-700">$15,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Pending Approvals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingApprovals.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.employee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.status === "pending" && (
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                        <button className="text-red-600 hover:text-red-900 font-medium">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 text-indigo-600 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Payroll processed for May 2023</div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">New employee John Smith added</div>
              <div className="text-sm text-gray-500">5 hours ago</div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-500">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Leave request approved for Sarah Johnson</div>
              <div className="text-sm text-gray-500">Yesterday at 3:45 PM</div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">Salary adjustment for Robert Wilson</div>
              <div className="text-sm text-gray-500">Yesterday at 1:30 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

