// 根据层级通过正则匹配判主标题还是副标题

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)


// 将输入的Markdown转化为HTML
const convert = raw => {
    let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s != "").map(s => s.trim())

    let html = ''
    for (let i = 0; i < arr.length; i++) {

        if (arr[i + 1] !== undefined) {
            if (isMain(arr[i]) && isMain(arr[i + 1])) {
                html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`
            } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
                html += `
<section>
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`
            } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
                html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`
            } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
                html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
</section>
`
            }

        } else {
            if (isMain(arr[i])) {
                html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`
            } else if (isSub(arr[i])) {
                html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
</section>
`
            }
        }

    }

    return html
}
const Menu = {
    init () {
        this.$settingIcon = document.querySelector(".fa.fa-cog");
        this.$menu = document.querySelector(".menu")
        this.$closeIcon = document.querySelector(".menu .fa-times")
        this.$$tabs = document.querySelectorAll(".menu .tab")
        this.$$contents = document.querySelectorAll(".menu .content")
        this.bind()
    },
    bind () {
        this.$settingIcon.onclick = () => {
            this.$menu.classList.add("open")
        }
        this.$closeIcon.onclick = () => {
            this.$menu.classList.remove("open")
        }
        this.$$tabs.forEach($tab => $tab.onclick = () => {
            this.$$tabs.forEach($tab => $tab.classList.remove("active"))
            $tab.classList.add("active")
            let index = [...this.$$tabs].indexOf($tab)
            this.$$contents.forEach($content => $content.classList.remove("active"))
            this.$$contents[index].classList.add("active")
        })
    }
}
const Editor = {
    init () {
        this.$editInput = document.querySelector(".editor textarea")
        this.$saveBtn = document.querySelector(".editor .btn-save")
        this.markdown = localStorage.markdown || "# My PPT"
        this.$slideContainer = document.querySelector(".slides")
        this.bind()
        this.start()
    },
    bind () {
        this.$saveBtn.onclick = () => {
            localStorage.markdown = this.$editInput.value
            location.reload()
        }
    },
    start () {
        // 初始模板，然后保存在LocalStorage中
        this.$editInput.value = this.markdown
        this.$slideContainer.innerHTML = convert(this.markdown)
        Reveal.initialize({
            controls: true,
            progress: true,
            center: localStorage.align === "top-left" ? false : true,
            hash: true,
            transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom

            // More info https://github.com/hakimel/reveal.js#dependencies
            dependencies: [
                { src: 'plugin/markdown/marked.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
                { src: 'plugin/markdown/markdown.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
                { src: 'plugin/highlight/highlight.js' },
                { src: 'plugin/search/search.js', async: true },
                { src: 'plugin/zoom-js/zoom.js', async: true },
                { src: 'plugin/notes/notes.js', async: true }
            ]
        });
    }
}

const Theme = {
    init () {
        this.$transition = document.querySelector(".theme .transition")
        this.$$figures = document.querySelectorAll(".theme figure")
        this.$align = document.querySelector(".theme .align")
        this.$reveal = document.querySelector('.reveal')
        this.bind()
        this.loadTheme()
    },
    bind () {
        this.$$figures.forEach($figure => $figure.onclick = () => {
            this.$$figures.forEach($item => $item.classList.remove("select"))
            $figure.classList.add("select")
            this.setTheme($figure.dataset.theme)
        })
        this.$transition.onchange = function () {
            localStorage.transition = this.value
            location.reload()
        }
        this.$align.onchange = function () {
            localStorage.align = this.value
            location.reload()
        }
    },

    setTheme (theme) {
        localStorage.theme = theme
        location.reload()
    },

    loadTheme () {
        let theme = localStorage.theme || "beige"
        let $link = document.createElement("link")
        $link.rel = "stylesheet"
        $link.href = `css/theme/${theme}.css`
        document.head.appendChild($link)
        Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add("select")
        this.$transition.value = localStorage.transition || "slide"
        this.$align.value = localStorage.align || "center"
        this.$reveal.classList.add(this.$align.value)
    }
}

const Print = {
    init () {
        this.$download = document.querySelector(".download")
        this.bind()
        this.start()
    },
    bind () {
        this.$download.addEventListener("click", () => {
            let $link = document.createElement("a")
            $link.setAttribute("target", "_blank")
            //
            $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
            console.log($link);
            $link.click()
        })
        window.onafterprint = () => window.close()
    },
    start () {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        if (window.location.href.match(/print-pdf/gi)) {
            link.href = "css/print/pdf.css"
            window.print()
        } else {
            link.href = "css/print/paper.css"
        }
        document.head.appendChild(link);
    }
}
const App = {
    init () {
        [...arguments].forEach(Module => Module.init())
    }
}

const ImgUploader = {
    init () {
        this.$fileInput = document.querySelector("#img-uploader")
        this.$textarea = document.querySelector(".editor textarea")
        AV.init({
            appId: "fAWi3Kq6u2Muq9dDOXrNX4gy-gzGzoHsz",
            appKey: "u4WKCw3GHUKnMmW3VHsluBFH",
            serverURLs: "https://fawi3kq6.lc-cn-n1-shared.com"
        });
        this.bind()
    },
    bind () {
        let self = this

        this.$fileInput.onchange = function () {
            if (this.files.length > 0) {
                let localFile = this.files[0]
                console.log(localFile)
                if (localFile.size / 1048576 > 2) {
                    alert('文件不能超过2M')
                    return
                }
                self.insertText(`![上传中，进度0%]()`)
                let avFile = new AV.File(encodeURI(localFile.name), localFile)
                avFile.save({
                    keepFileName: true,
                    onprogress (progress) {
                        self.insertText(`![上传中，进度${progress.percent}%]()`)
                    }
                }).then(file => {
                    console.log('文件保存完成')
                    console.log(file)
                    let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
                    self.insertText(text)
                }).catch(err => console.log(err))
            }
        }


    },
    insertText (text = '') {
        let $textarea = this.$textarea
        let start = $textarea.selectionStart
        let end = $textarea.selectionEnd
        let oldText = $textarea.value

        $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
        $textarea.focus()
        $textarea.setSelectionRange(start, start + text.length)
    }
}
App.init(Menu, Editor, Theme, Print, ImgUploader)


