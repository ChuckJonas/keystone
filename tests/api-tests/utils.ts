import { KeystoneConfig, DatabaseProvider } from '@keystone-next/types';

// This function injects the db configuration that we use for testing in CI.
// This functionality is a keystone repo specific way of doing things, so we don't
// export it from the `@keystone-next/testing` package.
export const apiTestConfig = (
  config: Omit<KeystoneConfig, 'db'> & {
    db?: Omit<KeystoneConfig['db'], 'provider' | 'url' | 'adapter'>;
  }
): KeystoneConfig => ({
  ...config,
  db: {
    ...config.db,
    provider: process.env.TEST_ADAPTER as DatabaseProvider,
    url: process.env.DATABASE_URL as string,
  },
});

const unpackErrors = (errors: readonly any[] | undefined) =>
  (errors || []).map(({ locations, extensions: { exception, ...extensions }, ...unpacked }) => ({
    extensions,
    ...unpacked,
  }));

export const expectInternalServerError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, message }) => ({
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
      path,
      message,
    }))
  );
};

export const expectGraphQLValidationError = (
  errors: readonly any[] | undefined,
  args: { message: string }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ message }) => ({
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      message,
    }))
  );
};

export const expectAccessDenied = (errors: readonly any[] | undefined, args: { path: any[] }[]) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path }) => ({
      extensions: { code: 'KS_ACCESS_DENIED_CODE' },
      path,
      message: 'You do not have access to this resource',
    }))
  );
};

export const expectValidationError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; errors: { data: Record<string, any>; msg: string }[] }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, errors }) => ({
      extensions: { code: 'KS_VALIDATION_FAILURE_CODE', data: { errors } },
      path,
      message: 'You attempted to perform an invalid mutation',
    }))
  );
};

export const expectLimitsError = (
  errors: readonly any[] | undefined,
  args: { path: any[]; listKey: string; type: 'maxResults' | 'maxTotalResults'; limit: number }[]
) => {
  const unpackedErrors = unpackErrors(errors);
  expect(unpackedErrors).toEqual(
    args.map(({ path, listKey, type, limit }) => ({
      extensions: { code: 'KS_LIMITS_EXCEEDED_CODE', data: { listKey, type, limit } },
      path,
      message: 'Your request exceeded server limits',
    }))
  );
};

export const expectNestedError = (
  errors: readonly any[] | undefined,
  args: { path: (string | number)[]; message: string }[]
) => {
  const unpackedErrors = (errors || []).map(({ locations, ...unpacked }) => ({
    ...unpacked,
  }));
  expect(unpackedErrors).toEqual(args.map(({ path, message }) => ({ path, message })));
};
