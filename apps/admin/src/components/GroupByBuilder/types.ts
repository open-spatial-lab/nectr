import { GroupByQuery, SourceMeta } from "../QueryBuilder/types";

export type GroupByBuilderProps = {
 sources: SourceMeta[];
 groupbys: GroupByQuery[];
 onChange: (groupbys: GroupByQuery[]) => void;
}