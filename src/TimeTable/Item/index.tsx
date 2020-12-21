import Identifiable from "../../Protocol/Identifiable"
import { IndexRangeable } from "../../Protocol/IndexPath"

export default interface Item extends IndexRangeable, Identifiable { }