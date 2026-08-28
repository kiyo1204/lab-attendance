const InputArea = () => {
    return (
        <section className="registar-area">
            <h2>学生登録</h2>

            <div className="registar-input-area">
                <label htmlFor="id" style={{ display: "block", marginBottom: "2px" }}>学籍番号</label>
                <input type="text" id="id" required minLength={6} maxLength={10} size={10} />

                <label htmlFor="name" style={{ display: "block", marginBottom: "2px" }}>名前</label>
                <input type="text" id="name" />

                <label htmlFor="iccard"style={{ display: "block", marginBottom: "2px" }}>ICカード</label>
                <input type="button" id="iccard" value="ここをクリック" />
                
            </div>
        </section>
    )
}

export default InputArea