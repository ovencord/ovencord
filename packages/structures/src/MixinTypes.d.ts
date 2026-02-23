import type { MixinBase } from './Mixin.js';
import type { Structure } from './Structure.js';
import type { kData, kMixinConstruct } from './utils/symbols.js';
import type { CollapseUnion, MergePrototypes } from './utils/types.js';

/**
 * Type utility to provide accurate types for the runtime effects of {@link Mixin}
 *
 * @typeParam BaseClass - The class that is being directly extended, must match the class that the mixins are expecting
 * @typeParam Mixins - The mixins that will be applied to this class via a {@link Mixin} call
 */
export type MixinTypes<BaseClass extends Structure<{}>, Mixins extends readonly MixinBase<BaseClass>[]> = CollapseUnion<
	BaseClass extends Structure<infer DataType, infer Omitted>
		? Mixins[number] extends Structure<DataType, Omitted>
			? // prettier-ignore
				Structure<DataType, Omitted>[typeof kData] extends Mixins[number][typeof kData] // @ts-expect-error kData is protected
				? Omit<MergePrototypes<Mixins>, keyof BaseClass | typeof kMixinConstruct>
				: never
			: never
		: never
>;
