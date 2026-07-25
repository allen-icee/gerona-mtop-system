import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function useDirtyNavigation(isDirty: boolean) {
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [pendingVisit, setPendingVisit] = useState<any>(null);
    const isBypassingRef = useRef(false);

    useEffect(() => {
        // Handle Inertia navigation
        const removeListener = router.on('before', (event) => {
            if (isDirty && !isBypassingRef.current && event.detail.visit.method === 'get') {
                event.preventDefault();
                setPendingVisit(event.detail.visit);
                setShowDiscardModal(true);
            }
        });

        // Handle native browser reload/close
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            removeListener();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    const confirmDiscard = () => {
        isBypassingRef.current = true;
        setShowDiscardModal(false);
        if (pendingVisit) {
            router.visit(pendingVisit.url, {
                method: pendingVisit.method,
                data: pendingVisit.data,
                replace: pendingVisit.replace,
                preserveState: pendingVisit.preserveState,
                preserveScroll: pendingVisit.preserveScroll,
                only: pendingVisit.only,
                headers: pendingVisit.headers,
                errorBag: pendingVisit.errorBag,
                forceFormData: pendingVisit.forceFormData,
            });
        }
    };

    const cancelDiscard = () => {
        setShowDiscardModal(false);
        setPendingVisit(null);
        isBypassingRef.current = false;
    };

    return {
        showDiscardModal,
        confirmDiscard,
        cancelDiscard,
    };
}
