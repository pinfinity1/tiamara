import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="h-[calc(100vh-150px)] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="text-right">
            <CardTitle className="font-bold text-base">
              گفتگوی اختصاصی با تیام
            </CardTitle>
            <p className="text-xs text-green-600">● آنلاین</p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <p>
            منطق اصلی چت (کامپوننت ChatConversation) در اینجا قرار خواهد گرفت...
          </p>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <p>فرم ارسال پیام در اینجا قرار خواهد گرفت...</p>
        </CardFooter>
      </Card>
    </div>
  );
}
