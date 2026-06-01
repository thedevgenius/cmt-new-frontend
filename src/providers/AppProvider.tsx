import { ReduxProvider } from "./StoreProvider";


export default function AppProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReduxProvider>
                {children}
        </ReduxProvider>
    );
}