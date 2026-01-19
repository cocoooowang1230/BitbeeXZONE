"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react"

interface WalletBindingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onBindSuccess: (uid: string) => void
    onGoToWithdraw: () => void
}

export function WalletBindingModal({
    open,
    onOpenChange,
    onBindSuccess,
    onGoToWithdraw,
}: WalletBindingModalProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [uid, setUid] = useState("")
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)
    const [userInfo, setUserInfo] = useState<{ phone: string, email: string } | null>(null)

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setStep(1)
            setUid("")
            setOtp("")
            setError("")
            setCountdown(0)
            setUserInfo(null)
        }
    }, [open])

    // Timer functionality for Step 3
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    // Step 1: Query User Masked Info (ZOO -> ZONE)
    const handleStep1Submit = () => {
        if (!uid) {
            setError("請輸入 UID")
            return
        }
        if (uid.length < 6) {
            setError("UID 格式錯誤")
            return
        }

        setIsLoading(true)
        setError("")

        // Simulate API: ZOO sends UID to ZONE, ZONE returns masked info
        setTimeout(() => {
            setIsLoading(false)
            // Mock response
            setUserInfo({
                phone: "09xxxxx845",
                email: "aaron.huxx@gmail.com",
            })
            setStep(2)
        }, 1000)
    }

    // Step 2: Trigger SMS (ZOO calls API -> ZONE sends SMS)
    const handleStep2Submit = () => {
        setIsLoading(true)

        // Simulate API: Notify ZONE to send SMS
        setTimeout(() => {
            setIsLoading(false)
            setCountdown(60)
            setStep(3)
        }, 1000)
    }

    // Step 3: Verify and Bind (User enters code -> ZOO sends Code+UID to ZONE -> ZONE verifies -> Bind)
    const handleStep3Submit = () => {
        if (otp.length !== 6) {
            setError("驗證碼應為 6 位數")
            return
        }

        setIsLoading(true)
        setError("")

        // Simulate API: Verify Code and Bind
        setTimeout(() => {
            setIsLoading(false)
            // Mock success
            if (otp) {
                handleSuccess()
            }
        }, 1500)
    }

    const handleSuccess = () => {
        onBindSuccess(uid)
        setStep(4)
    }

    // Resend OTP
    const handleResendOtp = () => {
        if (countdown > 0) return
        setCountdown(60)
        // Here you would trigger the API to resend
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white max-w-[90%] sm:max-w-md rounded-2xl overflow-hidden border-0 shadow-2xl">

                {/* Step 1: Input UID */}
                {step === 1 && (
                    <>
                        <AlertDialogHeader className="space-y-3">
                            <AlertDialogTitle className="text-2xl font-bold text-center text-gray-900">
                                驗證你的帳號
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-gray-500">
                                為確保是本人操作，請輸入你的 ZONE UID
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4 px-2 space-y-4">
                            {/* Tutorial Banner */}
                            <Link
                                href="/tasks"
                                onClick={() => onOpenChange(false)}
                                className="block overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow active:scale-95 duration-200"
                            >
                                <div className="relative aspect-[16/7] w-full">
                                    <Image
                                        src="/images/zone_wallet_banner.png"
                                        alt="ZONE Wallet 教學"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                        <p className="text-white text-xs font-bold flex items-center gap-1">
                                            <span>👉 還沒有 UID？先看綁定教學</span>
                                            <span className="bg-lion-orange px-1.5 py-0.5 rounded text-[10px]">去領獎勵</span>
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700 ml-1">請輸入你的 ZONE UID</p>
                                <Input
                                    placeholder="請輸入 UID"
                                    value={uid}
                                    onChange={(e) => {
                                        setUid(e.target.value)
                                        setError("")
                                    }}
                                    className="text-center text-lg h-12 border-gray-200 bg-gray-50 focus:bg-white transition-all rounded-xl"
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-1 text-center flex items-center justify-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </p>
                            )}
                        </div>

                        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                            <Button
                                className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-11 font-medium text-base shadow-lg shadow-gray-200"
                                onClick={handleStep1Submit}
                            >
                                下一步
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
                                onClick={() => onOpenChange(false)}
                            >
                                取消
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

                {/* Step 2: Confirm Contact Info */}
                {step === 2 && (
                    <>
                        <AlertDialogHeader className="space-y-3">
                            <AlertDialogTitle className="text-2xl font-bold text-center text-gray-900">
                                確認你的聯絡資訊
                            </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">手機</p>
                                        <p className="text-gray-900 font-semibold">{userInfo?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Email</p>
                                        <p className="text-gray-900 font-semibold">{userInfo?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-gray-400 text-sm">
                                若資訊正確，請發送驗證碼
                            </p>
                        </div>

                        <AlertDialogFooter className="flex-col gap-3 space-y-0 sm:space-y-0">
                            <Button
                                className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-11 font-medium shadow-lg shadow-gray-200"
                                onClick={handleStep2Submit}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "確認並發送驗證碼"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
                                onClick={() => setStep(1)} // Back to step 1 or close? User said "這不是我", implied maybe wrong UID
                            >
                                這不是我
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

                {/* Step 3: Input OTP */}
                {step === 3 && (
                    <>
                        <AlertDialogHeader className="space-y-3">
                            <AlertDialogTitle className="text-2xl font-bold text-center text-gray-900">
                                輸入驗證碼
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-gray-500">
                                我們已將 6 位數驗證碼發送至你的手機
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-6 px-2 space-y-4">
                            <div className="flex justify-center">
                                <Input
                                    placeholder="_ _ _ _ _ _"
                                    value={otp}
                                    maxLength={6}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '')
                                        setOtp(value)
                                        setError("")
                                    }}
                                    className="text-center text-2xl tracking-[0.5em] h-14 w-full max-w-[240px] border-gray-200 focus:border-black transition-all rounded-xl font-mono"
                                    style={{ letterSpacing: '0.5em' }}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </p>
                            )}

                            <div className="flex justify-center items-center gap-2 text-sm">
                                <span className="text-gray-400">沒有收到？</span>
                                <button
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0}
                                    className={`font-medium ${countdown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                                >
                                    {countdown > 0 ? `重新發送 (${countdown}s)` : '重新發送驗證碼'}
                                </button>
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <Button
                                className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-11 font-medium text-base shadow-lg shadow-gray-200"
                                onClick={handleStep3Submit}
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "確認驗證"}
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <>
                        <div className="py-10 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900">驗證成功！</h2>
                            <p className="text-gray-500">你的帳號已成功綁定 ZONE</p>
                        </div>

                        <AlertDialogFooter>
                            <Button
                                className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-11 font-medium text-base shadow-lg shadow-gray-200"
                                onClick={onGoToWithdraw}
                            >
                                前往提領
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

            </AlertDialogContent>
        </AlertDialog>
    )
}
