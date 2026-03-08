import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'

export default forwardRef((props, ref) => {
    const { items, command } = props;
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = index => {
        const item = items[index]

        if (item) {
            command(item)
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => {
        setSelectedIndex(0)
    }, [items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="z-50 min-w-[280px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1.5 mb-1">
                AI Commands
            </div>
            {items.map((item, index) => {
                const Icon = item.icon
                return (
                    <button
                        className={`flex items-center gap-3 px-2 py-2 w-full text-left text-sm rounded-lg transition-colors ${index === selectedIndex
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <div className={`p-1 rounded-md ${index === selectedIndex ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold">{item.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.description}</span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
})
