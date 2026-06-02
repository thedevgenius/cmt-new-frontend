import { ReduxProvider } from "./StoreProvider";
import { Toaster } from "react-hot-toast";

export default function AppProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReduxProvider>
            {children}
            <Toaster position="bottom-center" />
        </ReduxProvider>
    );
}