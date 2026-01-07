"use client"

import { useState, useEffect } from "react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCryptoValue } from "@/lib/utils"
import { AlertCircle, ArrowRight, Check } from "lucide-react"

interface WithdrawalModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    balances: {
        USDT: number
        WBTC: number
    }
}

export function WithdrawalModal({ open, onOpenChange, balances }: WithdrawalModalProps) {
    const [currency, setCurrency] = useState<"USDT" | "WBTC">("USDT")
    const [amount, setAmount] = useState("")
    const [targetCurrency, setTargetCurrency] = useState<"TWD" | "Other">("TWD")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Exchange Rates
    const RATES = {
        USDT_TO_TWD: 31.3,
        WBTC_TO_TWD: 2850000,
        WBTC_TO_USDT: 91054, // Approx 2,850,000 / 31.3
    }

    const MIN_WITHDRAWAL_USDT = 10

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setAmount("")
            setError("")
            setSuccess(false)
            setShowConfirm(false)
        }
    }, [open])

    const getAvailableBalance = () => {
        return balances[currency]
    }

    const getEquivalentTwd = (val: number, curr: "USDT" | "WBTC") => {
        const rate = curr === "USDT" ? RATES.USDT_TO_TWD : RATES.WBTC_TO_TWD
        return Math.floor(val * rate)
    }

    const getEquivalentUsdtValue = (val: number, curr: "USDT" | "WBTC") => {
        if (curr === "USDT") return val
        return val * RATES.WBTC_TO_USDT
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setAmount(val)
        setError("")

        // Basic validation on type
        if (val && Number.isNaN(Number(val))) {
            setError("請輸入有效數字")
            return
        }
    }

    const validate = () => {
        const numAmount = Number(amount)
        const balance = getAvailableBalance()

        if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
            setError("請輸入有效金額")
            return false
        }

        if (numAmount > balance) {
            setError(`金額超過可用餘額`)
            return false
        }

        const usdtValue = getEquivalentUsdtValue(numAmount, currency)
        if (usdtValue < MIN_WITHDRAWAL_USDT) {
            setError(`出金金額需至少 ${MIN_WITHDRAWAL_USDT} USDT 等值`)
            return false
        }

        return true
    }

    const handleInitialSubmit = () => {
        if (validate()) {
            setShowConfirm(true)
        }
    }

    const handleFinalConfirm = () => {
        // Simulate API call
        setTimeout(() => {
            setSuccess(true)
            setShowConfirm(false)
        }, 1000)
    }

    const calculatedTwd = amount && !Number.isNaN(Number(amount))
        ? getEquivalentTwd(Number(amount), currency)
        : 0

    if (success) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-white max-w-sm rounded-xl">
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <Check className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">出金成功！</h2>
                        <p className="text-gray-600">
                            約 {calculatedTwd.toLocaleString()} TWD 已轉入你的錢包
                        </p>
                        <Button
                            className="w-full mt-4 bg-lion-orange hover:bg-lion-red text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            完成
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    if (showConfirm) {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent className="bg-white max-w-sm rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>確認出金</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-gray-600">
                            確認提取 <span className="font-bold text-black">{amount} {currency}</span> 至你的 ZoneWallet 嗎？
                        </p>
                        <div className="bg-gray-50 p-3 rounded border text-sm text-gray-500">
                            預計收到：{calculatedTwd.toLocaleString()} TWD
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            取消
                        </Button>
                        <Button className="bg-lion-orange hover:bg-lion-red text-white" onClick={handleFinalConfirm}>
                            確認
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white max-w-md rounded-xl overflow-hidden">
                <AlertDialogHeader className="bg-gray-50 -mx-6 -mt-6 p-4 border-b">
                    <AlertDialogTitle className="text-center text-lg">出金操作</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-6 pt-4">
                    {/* From Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">從：</label>
                        <div className="flex rounded-md shadow-sm">
                            <div className="relative">
                                <select
                                    className="rounded-l-md border border-r-0 h-12 pl-3 pr-8 bg-gray-50 text-sm focus:ring-2 focus:ring-lion-orange focus:outline-none appearance-none font-medium w-[100px]"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as "USDT" | "WBTC")}
                                >
                                    <option value="USDT">USDT</option>
                                    <option value="WBTC">WBTC</option>
                                </select>
                                <div className="absolute right-2 top-3.5 pointer-events-none text-gray-400 text-xs">
                                    ▼
                                </div>
                            </div>
                            <Input
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                                className={`rounded-none rounded-r-md h-12 border-l px-4 text-right text-lg font-bold ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs text-gray-500">
                                可用餘額: {currency === "USDT" ? formatCryptoValue(balances.USDT) : formatCryptoValue(balances.WBTC)} {currency}
                            </span>
                            {error ? (
                                <span className="text-xs text-red-500">{error}</span>
                            ) : (
                                <span className="text-xs text-gray-400">最低: {MIN_WITHDRAWAL_USDT} USDT</span>
                            )}
                        </div>
                    </div>

                    {/* Arrow Separator */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white p-2 rounded-full border shadow-sm text-gray-400">
                            <ArrowRight className="h-4 w-4 rotate-90" />
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">轉換至：</label>
                        <div className="flex rounded-md shadow-sm">
                            <div className="relative">
                                <select
                                    className="rounded-l-md border border-r-0 h-12 pl-3 pr-8 bg-gray-50 text-sm focus:ring-2 focus:ring-lion-orange focus:outline-none appearance-none font-medium w-[100px]"
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value as "TWD" | "Other")}
                                >
                                    <option value="TWD">TWD</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute right-2 top-3.5 pointer-events-none text-gray-400 text-xs">
                                    ▼
                                </div>
                            </div>
                            <div className="flex-1 border rounded-r-md h-12 flex items-center justify-end px-4 bg-gray-50 text-gray-700 font-bold text-lg">
                                {amount && !Number.isNaN(Number(amount)) ? calculatedTwd.toLocaleString() : "0"}
                            </div>
                        </div>
                        <div className="text-right px-1">
                            <span className="text-xs text-gray-500">
                                匯率: 1 {currency} ≈ {currency === "USDT" ? RATES.USDT_TO_TWD : RATES.WBTC_TO_TWD.toLocaleString()} {targetCurrency}
                            </span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        取消
                    </AlertDialogCancel>
                    <Button
                        className="bg-lion-orange hover:bg-lion-red text-white"
                        disabled={!amount || !!error}
                        onClick={handleInitialSubmit}
                    >
                        確認出金
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
