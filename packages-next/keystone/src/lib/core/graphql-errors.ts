import { ApolloError } from 'apollo-server-errors';

export const ValidationFailureError = (extensions: {
  data: { errors: { msg: string; data: Record<string, any> }[] };
}) =>
  new ApolloError(
    'You attempted to perform an invalid mutation',
    'KS_VALIDATION_FAILURE_CODE',
    extensions
  );

export const LimitsExceededError = (data: {
  listKey: string;
  type: 'maxResults' | 'maxTotalResults';
  limit: number;
}) => new ApolloError('Your request exceeded server limits', 'KS_LIMITS_EXCEEDED_CODE', { data });

export const AccessDeniedError = () =>
  new ApolloError('You do not have access to this resource', 'KS_ACCESS_DENIED_CODE');
