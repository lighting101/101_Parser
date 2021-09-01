import IAccount from "./IAccount";
import {JoberFormat, TaskFormat} from "../../../../common";

/*
Классы реализующие ICBAccountPool нужны для того, чтоб работать с пуллом аккунтов.

Задачи классов, реализующих ICBAccountPool:
  - Загрузка из хранилища списка аккаунтов
  - Поддержание списка в актуальном состоянии (аккаунты в списке должны быть готовыми к работе)
    - Удаление из списка нерабочих или аккаунтов с оконченным лимитом
  - Сохранение в хранилище состояния аккаунтов (сессия/cac/proxy)
  - Отключение (в хранилище) аккаунтов с неверными логином или паролем
  - Обработка ошибок при использовании аккаунтов
  - Проксирование или мост методов аккаунтов

 */

export default interface ICBAccountPool
{
    getAccount():Promise<IAccount>
    beforeWork():Promise<void>
    afterWork():Promise<void>
    getResumeList(task:TaskFormat): Promise<{page:number, maxPage:number, resumes:string[]}>
    getResume(task:TaskFormat): Promise<JoberFormat>
}
