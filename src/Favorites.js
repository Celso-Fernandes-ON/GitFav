import { GithubUser } from "./GithubUser.js"

export class Favorites{
    constructor(root){
        this.root = document.querySelector(root)

        this.load()
    }
    load(){
        this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []

    }
    save(){
        localStorage.setItem('@github-favorites', JSON.stringify(this.entries))
    }
    async add(username){
        try{
            const userExist = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())
            if(userExist){
                throw new Error(`Usuário ${username} já focadastrado`)
            }

            const user = await GithubUser.search(username)
            if(user.login === undefined){
                throw new Error(`Usuário ${username} não encontrado!`)
            }
            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        }catch(error){
            alert(error.message)
        }
    }
    delete(user){
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites{
    constructor(root){
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onAdd()
    }
    
    onAdd(){
        const addButton = this.root.querySelector('#search')
        const search = this.root.querySelector("#input-search")
        addButton.onclick = () => {
            event.preventDefault()
            const {value} = this.root.querySelector("#input-search")
            this.add(value)
            search.value = ''
        }
    }
    defaultNoUsers(){
        const tr = document.createElement('tr')
        tr.innerHTML = 
        `
            <tr >
                <td id="no-users">
                    <img src="./assets/Estrela.svg" alt="">
                    <p>Nenhum favorito ainda</p>
                </td>
            </tr>
        `
        document.documentElement.classList.add('no-user')
        return tr;
    }
    update(){
        this.removeAllTr()
        if(this.entries.length === 0){
            const row = this.defaultNoUsers()
            this.tbody.append(row)
        }else{
            document.documentElement.classList.remove('no-user')
            this.entries.forEach(user => {
                const row = this.createRow()
                row.querySelector('.user img').src = `http://github.com/${user.login}.png`
                row.querySelector('.user img').alt = `Imagem de ${user.name}`
                row.querySelector('.user a').href = `http://github.com/${user.login}`
                row.querySelector('.user p').textContent = user.name
                row.querySelector('.user span').textContent = user.login
                row.querySelector('.repositories').textContent = user.public_repos
                row.querySelector('.followers').textContent = user.followers
                row.querySelector('.action').onclick = () => {
                    const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                    if(isOk){
                        this.delete(user)
                    }
                }
    
                this.tbody.append(row)
            })
        }
    }
    createRow(){
        const tr = document.createElement('tr')

        tr.innerHTML =
        `
            <td class="user">
                <img src="http://github.com/diego3g.png" alt="Imagem de Diego Fernandes">
                <a target="_blank" href="http://github.com/diego3g">
                    <p>Diego Fernandes</p>
                    <span>diego3g</span>
                </a>
            </td>
            <td class="repositories">123</td>
            <td class="followers">1234</td>
            <td class="action">
                <button>Remover</button>
            </td>
        `
        return tr
    }

    removeAllTr(){

        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        });
    }
}