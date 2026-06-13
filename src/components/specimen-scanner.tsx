"use client";

export function SpecimenScanner() {
    function scan(value: string) {
        const id = parseInt(value);
        if (!isNaN(id) && id >= 0 && id <= 9999) {
            window.location.href = `/specimen/${id}`;
        }
    }

    return (
        <div className="scanner-input">
            <span className="scanner-prefix">#</span>
            <input
                type="number"
                min={0}
                max={9999}
                placeholder="0000"
                className="scanner-field"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        scan((e.target as HTMLInputElement).value);
                    }
                }}
            />
            <button
                className="scanner-btn"
                onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    scan(input.value);
                }}
            >
                SCAN
            </button>
        </div>
    );
}