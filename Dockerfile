FROM nobidev/nodejs

COPY ./ /app/

RUN yarn

RUN yarn build

FROM nobidev/nodejs

COPY --from=0 /app/package.json /app/
COPY --from=0 /app/node_modules/ /app/node_modules/
COPY --from=0 /app/dist/ /app/dist/

CMD [ "yarn", "start" ]
