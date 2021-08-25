export function protectGeneration(count: number) {
    let generatedStr = localStorage.getItem("generated")
    let totalCount = count;
    if (generatedStr) {
        let generated = JSON.parse(generatedStr) as { date: string, count: number };
        const day = 86400000;
        const maxCount = 24 * 10;
        if (new Date().getTime() - (new Date(generated.date)).getTime() < day) {
            if ((generated.count + count) >= maxCount) {
                throw new Error("Вы создали сегодня слишком много бирок. Обратитесь к организаторам склада.")
            }
            totalCount += generated.count;
        }        
    }
    localStorage.setItem("generated", JSON.stringify({ date: new Date(), count: totalCount }));
}